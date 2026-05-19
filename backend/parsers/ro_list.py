"""
Parser for Tekion RO List xlsx files
Extracts RO-level data and derives task records from dollar amounts
Used primarily for 2023 (when Tech Report doesn't exist)
"""

import pandas as pd
from datetime import datetime
from typing import List, Dict, Any


def get_hourly_rate_for_year(year: int) -> float:
    """
    Get the hourly rate for a given year based on tiered schedule.
    Matches the logic in backend/routers/stats.py

    - 2020-2022: $24.00/hr
    - 2023: $32.00/hr
    - 2024: $36.00/hr
    - 2025-current: $37.50/hr
    """
    if year <= 2022:
        return 24.0
    elif year == 2023:
        return 32.0
    elif year == 2024:
        return 36.0
    else:
        return 37.5


def parse_ro_list(filepath: str) -> List[Dict[str, Any]]:
    """
    Parse RO List xlsx file.
    For each RO with CP/WP/IP amounts, create one task per pay type.

    Back-calculates flag hours from dollar amounts using tiered rates.
    Assumes efficiency = 1.0 (actual hours = flag hours) since RO List has no clock data.

    Args:
        filepath: Path to RO List_XX.xlsx

    Returns:
        List of task dicts ready for database insertion
    """
    try:
        df = pd.read_excel(filepath, sheet_name='RO List', header=0, engine='openpyxl')
    except Exception as e:
        raise ValueError(f"Failed to read RO List sheet: {e}")

    tasks = []

    for idx, row in df.iterrows():
        try:
            # Parse RO opened date
            ro_opened_date = pd.to_datetime(row.get('RO Opened Date', None), errors='coerce')
            if pd.isna(ro_opened_date):
                continue

            year = ro_opened_date.year
            hourly_rate = get_hourly_rate_for_year(year)

            ro_number = str(row.get('RO#', '') or '').strip()
            technician = str(row.get('Technician', '') or '').strip()

            # Only include if technician matches user (TANNER / ANTHONY)
            if technician and not any(name.upper() in technician.upper() for name in ['TANNER', 'ANTHONY']):
                continue

            # Create one task per pay type with non-zero amount
            pay_type_map = {
                'CP Amount': 'cp',
                'WP Amount': 'wp',
                'IP Amount': 'ip'
            }

            for amount_col, pay_type in pay_type_map.items():
                amount = float(row.get(amount_col, 0) or 0)
                if amount <= 0:
                    continue

                # Back-calculate flag hours from dollar amount
                flag_hours = amount / hourly_rate if hourly_rate > 0 else 0

                task = {
                    'date': ro_opened_date,
                    'hours': flag_hours,  # No actual clock hours in RO List, assume efficiency = 1.0
                    'flag_hours': flag_hours,
                    'hourly_rate': hourly_rate,
                    'total': amount,
                    'pay_type': pay_type,
                    'opcode': 'OTHER',
                    'description': f'RO {ro_number} - {amount_col.replace(" Amount", "")}',
                }

                tasks.append(task)

        except Exception as e:
            # Skip rows with parse errors
            print(f"Warning: Skipping RO row {idx} due to parse error: {e}")
            continue

    return tasks
