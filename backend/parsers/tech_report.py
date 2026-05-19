"""
Parser for Tekion Technician Report xlsx files
Extracts flag-level job data from the Flag sheet
"""

import pandas as pd
from datetime import datetime
from typing import List, Dict, Any


def get_hourly_rate_for_year(year: int) -> float:
    """Get tiered hourly rate by year (no wage rate in Tekion Flag sheet)"""
    rates = {2023: 32.0, 2024: 36.0, 2025: 37.5, 2026: 37.5}
    return rates.get(year, 37.5)


def parse_flag_sheet(filepath: str) -> List[Dict[str, Any]]:
    """
    Parse the Flag sheet from Tekion Technician Report xlsx.
    Each row represents one flagged job with hours and pay type.

    Maps to Task model:
    - Flag Date → date
    - Flagged Hours → flag_hours
    - Actual Hours → hours
    - Pay Type (W/I/CP) → pay_type (wp/ip/cp)
    - Opcode → opcode
    - Concern → description
    - Wage Rate → hourly_rate

    Args:
        filepath: Path to Technician Report_XX.xlsx

    Returns:
        List of task dicts ready for database insertion
    """
    try:
        xl = pd.ExcelFile(filepath, engine='openpyxl')
        # Find the Flag sheet (sheet name starts with "Flag_")
        flag_sheets = [s for s in xl.sheet_names if s.startswith('Flag_')]
        if not flag_sheets:
            raise ValueError(f"No Flag sheet found. Available sheets: {xl.sheet_names}")

        flag_sheet = flag_sheets[0]

        try:
            df = pd.read_excel(xl, sheet_name=flag_sheet, header=0)
        except Exception as e:
            raise ValueError(f"Failed to read Flag sheet '{flag_sheet}': {e}")
        finally:
            xl.close()
    except Exception as e:
        raise ValueError(f"Failed to open Excel file: {e}")

    tasks = []
    pay_type_map = {'W': 'wp', 'I': 'ip', 'CP': 'cp'}

    for idx, row in df.iterrows():
        try:
            # Parse date from Flag Date column
            flag_date = pd.to_datetime(row.get('Flag Date', None), errors='coerce')
            if pd.isna(flag_date):
                continue

            # Extract numeric fields with null safety — handle both 2026 and 2024/2025 schemas
            # 2026 has: Flagged Hours, Actual Hours
            # 2024/2025 have: Bill Hrs (flagged), Assigned Billed Hrs (assigned)
            if 'Flagged Hours' in df.columns:
                flagged_val = row.get('Flagged Hours', 0)
            else:
                flagged_val = row.get('Bill Hrs', 0)
            flag_hours = float(flagged_val) if not pd.isna(flagged_val) else 0.0

            if 'Actual Hours' in df.columns:
                actual_val = row.get('Actual Hours', 0)
            else:
                # Older reports don't have actual hours; use flag hours or 0
                actual_val = 0
            actual_hours = float(actual_val) if not pd.isna(actual_val) else 0.0

            # Skip rows with no flag hours
            if flag_hours <= 0:
                continue

            # Get year and determine hourly rate (Wage Rate column in Flag sheet contains 'Hourly' label, not values)
            year = flag_date.year
            hourly_rate = get_hourly_rate_for_year(year)

            # Pay type conversion
            pay_type_raw = str(row.get('Pay Type', 'CP')).strip().upper()
            pay_type = pay_type_map.get(pay_type_raw, 'cp')

            # Build task dict
            task = {
                'date': flag_date,
                'hours': actual_hours,
                'flag_hours': flag_hours,
                'hourly_rate': hourly_rate,
                'total': flag_hours * hourly_rate,
                'pay_type': pay_type,
                'opcode': str(row.get('Opcode', 'OTHER') or 'OTHER').strip(),
                'description': str(row.get('Concern', '') or '').strip(),
            }

            tasks.append(task)

        except Exception as e:
            # Skip rows with parse errors
            print(f"Warning: Skipping row {idx} due to parse error: {e}")
            continue

    return tasks
