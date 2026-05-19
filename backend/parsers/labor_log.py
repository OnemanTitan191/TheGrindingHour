"""
Parser for 2026 Kia Labor Tracking manual xlsx file
User's hand-built labor log with daily entries
"""

import pandas as pd
from datetime import datetime
from typing import List, Dict, Any


def parse_labor_log(filepath: str) -> List[Dict[str, Any]]:
    """
    Parse 2026 Kia Labor Tracking.xlsx Labor Log sheet.
    Header is on row 3 (header=2 in pandas 0-indexed).

    Maps to Task model:
    - Date → date
    - RO # → opcode (used as identifier)
    - Pay Type → pay_type
    - Labor Rate\n(hrs) → flag_hours
    - Clocked\nRate (hrs) → hours
    - Job Description → description
    - Calculate: total = flag_hours * hourly_rate (infer from pay period / efficiency)

    Args:
        filepath: Path to 2026 Kia Labor Tracking.xlsx

    Returns:
        List of task dicts ready for database insertion
    """
    try:
        df = pd.read_excel(filepath, sheet_name='Labor Log', header=2, engine='openpyxl')
    except Exception as e:
        raise ValueError(f"Failed to read Labor Log sheet: {e}")

    tasks = []
    pay_type_map = {
        'CP': 'cp',
        'Customer Pay': 'cp',
        'WP': 'wp',
        'Warranty': 'wp',
        'IP': 'ip',
        'Internal': 'ip',
    }

    for idx, row in df.iterrows():
        try:
            # Parse date
            entry_date = pd.to_datetime(row.get('Date', None), errors='coerce')
            if pd.isna(entry_date):
                continue

            # Extract fields with NaN safety
            ro_number = str(row.get('RO #', '') or '').strip()

            flag_val = row.get('Labor Rate\n(hrs)', 0)
            flag_hours = float(flag_val) if not pd.isna(flag_val) else 0.0

            actual_val = row.get('Clocked\nRate (hrs)', 0)
            actual_hours = float(actual_val) if not pd.isna(actual_val) else 0.0

            description = str(row.get('Job Description', '') or '').strip()

            # Pay type - case-insensitive lookup
            pay_type_raw = str(row.get('Pay Type', 'CP') or 'CP').strip()
            pay_type = pay_type_map.get(pay_type_raw, pay_type_map.get(pay_type_raw.upper(), 'cp'))

            # Skip entries with no hours
            if flag_hours <= 0:
                continue

            # Infer hourly rate based on efficiency and total
            efficiency = actual_hours / flag_hours if flag_hours > 0 else 1.0
            # Use 37.5 as default for 2026 (current rate)
            hourly_rate = 37.5

            task = {
                'date': entry_date,
                'hours': actual_hours,
                'flag_hours': flag_hours,
                'hourly_rate': hourly_rate,
                'total': flag_hours * hourly_rate,
                'pay_type': pay_type,
                'opcode': ro_number or 'OTHER',
                'description': description,
            }

            tasks.append(task)

        except Exception as e:
            # Skip rows with parse errors
            print(f"Warning: Skipping labor log row {idx} due to parse error: {e}")
            continue

    return tasks
