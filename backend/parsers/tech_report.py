"""
Parser for Tekion Technician Report xlsx files.

Reads three sheets per file:
- Flag_*       : one row per flagged job → flag hours (Bill Hrs), pay type, opcode, RO number
- Attendance_* : daily total clock hours → stored as WorkSession.attendance_hours
- Actual_*     : clock-in/out per RO/job → RO number fallback for files without RO Number column
"""

import pandas as pd
from datetime import date
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from routers.rates import get_rate_for_date


def parse_attendance(filepath: str) -> Dict[date, float]:
    """
    Parse Attendance_ sheet and return {date: total_hours} for daily rows only.
    Skips period-summary rows (those with ' - ' in the Date field).
    Date format: 'Mon MMM D YYYY 12:00 AM'
    """
    try:
        xl = pd.ExcelFile(filepath, engine='openpyxl')
        att_sheets = [s for s in xl.sheet_names if s.startswith('Attendance_')]
        if not att_sheets:
            xl.close()
            return {}
        df = pd.read_excel(xl, sheet_name=att_sheets[0], header=0)
        xl.close()
    except Exception:
        return {}

    attendance = {}
    for _, row in df.iterrows():
        date_str = str(row.get('Date', ''))
        if ' - ' in date_str:
            continue
        try:
            parsed = pd.to_datetime(date_str.replace('12:00 AM', '').strip())
            day = parsed.date()
            hours = float(row['Total Hours']) if not pd.isna(row['Total Hours']) else 0.0
            attendance[day] = hours
        except Exception:
            continue
    return attendance


def _parse_actual_sheet_for_ro(xl: pd.ExcelFile) -> Dict[tuple, str]:
    """
    Parse Actual_ sheet into {(date_str, opcode): ro_number}.
    Fallback for files that don't have RO Number in the Flag_ sheet (e.g. 2025).
    """
    actual_sheets = [s for s in xl.sheet_names if s.startswith('Actual_')]
    if not actual_sheets:
        return {}

    df = pd.read_excel(xl, sheet_name=actual_sheets[0], header=0)
    ro_by_key = {}
    for _, row in df.iterrows():
        ro_no = row.get('RO No')
        opcode = str(row.get('Opcode', '')).strip().upper()
        clock_in = row.get('Clock-in Timestamp')
        if pd.isna(ro_no) or pd.isna(clock_in):
            continue
        try:
            day_str = pd.to_datetime(str(clock_in).split('|')[0].strip()).strftime('%Y-%m-%d')
        except Exception:
            continue
        key = (day_str, opcode)
        if key not in ro_by_key:
            ro_by_key[key] = str(int(ro_no))
    return ro_by_key


def parse_flag_sheet(filepath: str, db: Session) -> List[Dict[str, Any]]:
    """
    Parse the Flag sheet from a Tekion Technician Report xlsx.

    Flag hours always come from "Bill Hrs" column (the total hours billed,
    CP + WP + IP). Falls back to "Flagged Hours" if "Bill Hrs" is missing.

    RO numbers come from "RO Number" column when present (2026+),
    otherwise cross-referenced from Actual_ sheet by (date, opcode).

    Maps to Task model:
    - Flag Date          → date
    - Bill Hrs           → flag_hours (and hours — actual hours now stored at session level)
    - RO Number / Actual → ro_number
    - Pay Type           → pay_type (wp/ip/cp)
    - Opcode             → opcode
    - Concern            → description
    """
    try:
        xl = pd.ExcelFile(filepath, engine='openpyxl')
        flag_sheets = [s for s in xl.sheet_names if s.startswith('Flag_')]
        if not flag_sheets:
            raise ValueError(f"No Flag sheet found. Available: {xl.sheet_names}")

        # Build RO lookup from Actual_ sheet (fallback for files without RO Number column)
        ro_by_key = _parse_actual_sheet_for_ro(xl)

        df = pd.read_excel(xl, sheet_name=flag_sheets[0], header=0)
        xl.close()
    except Exception as e:
        raise ValueError(f"Failed to open Excel file: {e}")

    has_ro_column = 'RO Number' in df.columns

    pay_type_map = {
        'W': 'wp', 'WARRANTY': 'wp',
        'I': 'ip', 'INTERNAL': 'ip',
        'CP': 'cp', 'CUSTOMER_PAY': 'cp',
    }

    tasks = []
    for idx, row in df.iterrows():
        try:
            flag_date = pd.to_datetime(row.get('Flag Date', None), errors='coerce')
            if pd.isna(flag_date):
                continue

            # Always use Bill Hrs — this is the technician's total billed labor hours
            # (CP + WP + IP combined). Falls back to Flagged Hours if Bill Hrs absent.
            flagged_val = row.get('Bill Hrs', row.get('Flagged Hours', 0))
            flag_hours = float(flagged_val) if not pd.isna(flagged_val) else 0.0
            if flag_hours <= 0:
                continue

            year = flag_date.year
            opcode = str(row.get('Opcode', 'OTHER') or 'OTHER').strip().upper()
            pay_type_raw = str(row.get('Pay Type', 'CP')).strip().upper()
            pay_type = pay_type_map.get(pay_type_raw, 'cp')

            day = flag_date.date()
            day_str = day.strftime('%Y-%m-%d')

            # Prefer RO Number column (2026+); fall back to Actual_ cross-reference
            if has_ro_column:
                ro_val = row.get('RO Number')
                ro_number = str(int(ro_val)) if not pd.isna(ro_val) else None
            else:
                ro_number = ro_by_key.get((day_str, opcode))

            rate = get_rate_for_date(db, day)
            tasks.append({
                'date': flag_date,
                'hours': flag_hours,   # task.hours = flag_hours; attendance stored at session level
                'flag_hours': flag_hours,
                'hourly_rate': rate,
                'total': flag_hours * rate,
                'pay_type': pay_type,
                'opcode': opcode,
                'description': str(row.get('Concern', '') or '').strip(),
                'ro_number': ro_number,
            })

        except Exception as e:
            print(f"Warning: Skipping row {idx}: {e}")
            continue

    return tasks
