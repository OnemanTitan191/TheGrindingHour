"""
Parser for Kia Labor Tracking xlsx files (manual labor log).
Supports two formats:
  - 2025: header at row 0 — Date (forward-filled), Ro#, Hours (no pay type)
  - 2026: header at row 2 — Date, RO #, Pay Type, Labor Rate\n(hrs), Clocked\nRate (hrs)
"""

import pandas as pd
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from routers.rates import get_rate_for_date


PAY_TYPE_MAP = {
    'CP': 'cp',
    'Customer Pay': 'cp',
    'WP': 'wp',
    'Warranty': 'wp',
    'IP': 'ip',
    'Internal': 'ip',
}


def _parse_2025(df: pd.DataFrame, db: Session) -> List[Dict[str, Any]]:
    """2025 format: Date (forward-filled), Ro#, Hours. No pay type column."""
    df = df.copy()
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    df['Date'] = df['Date'].ffill()

    tasks = []
    for idx, row in df.iterrows():
        entry_date = row.get('Date')
        if pd.isna(entry_date):
            continue

        hours_val = pd.to_numeric(row.get('Hours', 0), errors='coerce')
        flag_hours = float(hours_val) if not pd.isna(hours_val) else 0.0
        if flag_hours <= 0:
            continue

        ro_number = str(row.get('Ro#', '') or '').strip()
        description = str(row.get('Work', '') or '').strip()
        hourly_rate = get_rate_for_date(db, entry_date.date())

        tasks.append({
            'date': entry_date,
            'hours': flag_hours,
            'flag_hours': flag_hours,
            'hourly_rate': hourly_rate,
            'total': flag_hours * hourly_rate,
            'pay_type': 'cp',
            'opcode': ro_number or 'OTHER',
            'ro_number': ro_number or None,
            'description': description,
        })
    return tasks


def _parse_2026(df: pd.DataFrame, db: Session) -> List[Dict[str, Any]]:
    """2026 format: header at row 2, has Date, RO #, Pay Type, Labor Rate, Clocked Rate."""
    tasks = []
    for idx, row in df.iterrows():
        entry_date = pd.to_datetime(row.get('Date', None), errors='coerce')
        if pd.isna(entry_date):
            continue

        ro_number = str(row.get('RO #', '') or '').strip()

        flag_val = row.get('Labor Rate\n(hrs)', 0)
        flag_hours = float(flag_val) if not pd.isna(flag_val) else 0.0
        if flag_hours <= 0:
            continue

        actual_val = row.get('Clocked\nRate (hrs)', 0)
        actual_hours = float(actual_val) if not pd.isna(actual_val) else 0.0

        description = str(row.get('Job Description', '') or '').strip()

        pay_type_raw = str(row.get('Pay Type', 'CP') or 'CP').strip()
        pay_type = PAY_TYPE_MAP.get(pay_type_raw, PAY_TYPE_MAP.get(pay_type_raw.upper(), 'cp'))

        hourly_rate = get_rate_for_date(db, entry_date.date())

        tasks.append({
            'date': entry_date,
            'hours': actual_hours,
            'flag_hours': flag_hours,
            'hourly_rate': hourly_rate,
            'total': flag_hours * hourly_rate,
            'pay_type': pay_type,
            'opcode': ro_number or 'OTHER',
            'ro_number': ro_number or None,
            'description': description,
        })
    return tasks


def parse_labor_log(filepath: str, db: Session) -> List[Dict[str, Any]]:
    """
    Auto-detect format and parse a Kia Labor Tracking xlsx.
    Returns list of task dicts ready for database insertion.
    """
    try:
        xl = pd.ExcelFile(filepath, engine='openpyxl')
    except Exception as e:
        raise ValueError(f"Failed to open file: {e}")

    if 'Labor Log' not in xl.sheet_names:
        raise ValueError("No 'Labor Log' sheet found in file")

    # Try 2026 format first (header at row index 2)
    try:
        df_26 = pd.read_excel(filepath, sheet_name='Labor Log', header=2, engine='openpyxl')
        if 'RO #' in df_26.columns and 'Labor Rate\n(hrs)' in df_26.columns:
            return _parse_2026(df_26, db)
    except Exception:
        pass

    # Fall back to 2025 format (header at row 0)
    df_25 = pd.read_excel(filepath, sheet_name='Labor Log', header=0, engine='openpyxl')
    if 'Ro#' in df_25.columns and 'Hours' in df_25.columns:
        return _parse_2025(df_25, db)

    raise ValueError("Unrecognized Labor Log format — expected 'RO #' (2026) or 'Ro#' (2025) column")
