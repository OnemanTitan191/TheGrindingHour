"""
Database backup and data export utilities
"""

import os
import json
import csv
from datetime import datetime
from pathlib import Path

BACKUP_DIR = Path("data/backups")
EXPORT_DIR = Path("data/exports")

def ensure_dirs():
    """Ensure backup and export directories exist"""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def backup_database(db_path: str = "grinddata.db") -> str:
    """
    Create a timestamped backup of the database
    Returns the backup file path
    """
    ensure_dirs()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"grinddata_backup_{timestamp}.db"
    backup_path = BACKUP_DIR / backup_filename

    if os.path.exists(db_path):
        import shutil
        shutil.copy(db_path, str(backup_path))
        return str(backup_path)
    return None

def export_sessions_to_csv(sessions: list, filename: str = None) -> str:
    """
    Export sessions to CSV
    Returns the export file path
    """
    ensure_dirs()
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"sessions_export_{timestamp}.csv"

    export_path = EXPORT_DIR / filename

    if sessions:
        with open(export_path, 'w', newline='') as csvfile:
            fieldnames = ['id', 'name', 'date', 'total_hours', 'total_rate']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for session in sessions:
                writer.writerow({
                    'id': session.id,
                    'name': session.name,
                    'date': session.date,
                    'total_hours': session.total_hours,
                    'total_rate': session.total_rate,
                })

    return str(export_path)

def export_sessions_to_json(sessions: list, filename: str = None) -> str:
    """
    Export sessions to JSON
    Returns the export file path
    """
    ensure_dirs()
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"sessions_export_{timestamp}.json"

    export_path = EXPORT_DIR / filename

    sessions_data = []
    for session in sessions:
        sessions_data.append({
            'id': session.id,
            'name': session.name,
            'date': str(session.date),
            'total_hours': session.total_hours,
            'total_rate': session.total_rate,
        })

    with open(export_path, 'w') as jsonfile:
        json.dump(sessions_data, jsonfile, indent=2)

    return str(export_path)
