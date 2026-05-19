"""
File upload and data import router
Handles Excel file uploads, parsing, and bulk insertion into the database
"""

import os
import tempfile
from datetime import datetime
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from database import get_db
from models import Task, WorkSession
from parsers import tech_report, ro_list, labor_log

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/tech-report")
async def upload_tech_report(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload Technician Report xlsx file and import flag-level task data.
    Deletes existing tasks for the year(s) covered by the file before inserting.

    Returns: count of inserted tasks and year range
    """
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="File must be .xlsx")

    try:
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse file
        tasks_data = tech_report.parse_flag_sheet(tmp_path)

        if not tasks_data:
            raise HTTPException(status_code=400, detail="No valid data found in file")

        # Determine year range
        years = set(pd.to_datetime(t['date']).year for t in tasks_data)
        min_year = min(years)
        max_year = max(years)

        # Delete existing tekion records for these years (tech report replaces all tekion data for the year)
        db.query(Task).filter(
            Task.source == 'tekion',
            func.strftime('%Y', Task.date) >= str(min_year),
            func.strftime('%Y', Task.date) <= str(max_year)
        ).delete(synchronize_session=False)

        # Create sessions grouped by date
        tasks_by_date = {}
        for task_data in tasks_data:
            task_date = pd.to_datetime(task_data['date']).date()
            if task_date not in tasks_by_date:
                tasks_by_date[task_date] = []
            tasks_by_date[task_date].append(task_data)

        # Insert sessions and tasks
        inserted_count = 0
        for task_date, tasks_for_date in tasks_by_date.items():
            # Create session for this date
            session = WorkSession(
                name=f"Tech Report {task_date}",
                date=datetime.combine(task_date, datetime.min.time()),
                start_time=None,
                end_time=None,
                total_hours=sum(t['flag_hours'] for t in tasks_for_date),
                total_rate=sum(t['total'] for t in tasks_for_date),
            )
            db.add(session)
            db.flush()  # Get the session ID

            # Insert tasks for this session
            for task_data in tasks_for_date:
                task = Task(
                    session_id=session.id,
                    date=pd.to_datetime(task_data['date']),
                    description=task_data['description'],
                    hours=task_data['hours'],
                    flag_hours=task_data['flag_hours'],
                    hourly_rate=task_data['hourly_rate'],
                    total=task_data['total'],
                    pay_type=task_data['pay_type'],
                    opcode=task_data['opcode'],
                    source='tekion',
                    completed=True,
                )
                db.add(task)
                inserted_count += 1

        db.commit()

        # Clean up temp file
        os.unlink(tmp_path)

        return {
            "status": "success",
            "inserted": inserted_count,
            "year_range": f"{min_year}-{max_year}",
            "files_processed": len(tasks_by_date)
        }

    except Exception as e:
        db.rollback()
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ro-list")
async def upload_ro_list(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload RO List xlsx file and import RO-level task data.
    Used primarily for 2023 (when Tech Report doesn't exist).
    Deletes existing RO List imports for the year(s) covered before inserting.

    Returns: count of inserted tasks and year range
    """
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="File must be .xlsx")

    try:
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse file
        tasks_data = ro_list.parse_ro_list(tmp_path)

        if not tasks_data:
            raise HTTPException(status_code=400, detail="No valid data found in file")

        # Determine year range
        years = set(pd.to_datetime(t['date']).year for t in tasks_data)
        min_year = min(years)
        max_year = max(years)

        # Delete existing tekion records (RO List is tekion source) for these years
        db.query(Task).filter(
            Task.source == 'tekion',
            func.strftime('%Y', Task.date) >= str(min_year),
            func.strftime('%Y', Task.date) <= str(max_year)
        ).delete(synchronize_session=False)

        # Create sessions grouped by date
        tasks_by_date = {}
        for task_data in tasks_data:
            task_date = pd.to_datetime(task_data['date']).date()
            if task_date not in tasks_by_date:
                tasks_by_date[task_date] = []
            tasks_by_date[task_date].append(task_data)

        # Insert sessions and tasks
        inserted_count = 0
        for task_date, tasks_for_date in tasks_by_date.items():
            # Create session
            session = WorkSession(
                name=f"RO List {task_date}",
                date=datetime.combine(task_date, datetime.min.time()),
                start_time=None,
                end_time=None,
                total_hours=sum(t['flag_hours'] for t in tasks_for_date),
                total_rate=sum(t['total'] for t in tasks_for_date),
            )
            db.add(session)
            db.flush()

            # Insert tasks
            for task_data in tasks_for_date:
                task = Task(
                    session_id=session.id,
                    date=pd.to_datetime(task_data['date']),
                    description=task_data['description'],
                    hours=task_data['hours'],
                    flag_hours=task_data['flag_hours'],
                    hourly_rate=task_data['hourly_rate'],
                    total=task_data['total'],
                    pay_type=task_data['pay_type'],
                    opcode=task_data['opcode'],
                    source='tekion',
                    completed=True,
                )
                db.add(task)
                inserted_count += 1

        db.commit()

        # Clean up temp file
        os.unlink(tmp_path)

        return {
            "status": "success",
            "inserted": inserted_count,
            "year_range": f"{min_year}-{max_year}",
            "files_processed": len(tasks_by_date)
        }

    except Exception as e:
        db.rollback()
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/labor-log")
async def upload_labor_log(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload 2026 Kia Labor Tracking xlsx file and import manual labor log data.
    Deletes existing Labor Log imports for 2026 before inserting.

    Returns: count of inserted tasks
    """
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="File must be .xlsx")

    try:
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse file
        tasks_data = labor_log.parse_labor_log(tmp_path)

        if not tasks_data:
            raise HTTPException(status_code=400, detail="No valid data found in file")

        # Delete existing Labor Log (manual) records for 2026
        db.query(Task).filter(
            Task.source == 'manual',
            func.strftime('%Y', Task.date) == '2026'
        ).delete(synchronize_session=False)

        # Create sessions grouped by date
        tasks_by_date = {}
        for task_data in tasks_data:
            task_date = pd.to_datetime(task_data['date']).date()
            if task_date not in tasks_by_date:
                tasks_by_date[task_date] = []
            tasks_by_date[task_date].append(task_data)

        # Insert sessions and tasks
        inserted_count = 0
        for task_date, tasks_for_date in tasks_by_date.items():
            # Create session
            session = WorkSession(
                name=f"Labor Log {task_date}",
                date=datetime.combine(task_date, datetime.min.time()),
                start_time=None,
                end_time=None,
                total_hours=sum(t['flag_hours'] for t in tasks_for_date),
                total_rate=sum(t['total'] for t in tasks_for_date),
            )
            db.add(session)
            db.flush()

            # Insert tasks
            for task_data in tasks_for_date:
                task = Task(
                    session_id=session.id,
                    date=pd.to_datetime(task_data['date']),
                    description=task_data['description'],
                    hours=task_data['hours'],
                    flag_hours=task_data['flag_hours'],
                    hourly_rate=task_data['hourly_rate'],
                    total=task_data['total'],
                    pay_type=task_data['pay_type'],
                    opcode=task_data['opcode'],
                    source='manual',
                    completed=True,
                )
                db.add(task)
                inserted_count += 1

        db.commit()

        # Clean up temp file
        os.unlink(tmp_path)

        return {
            "status": "success",
            "inserted": inserted_count,
            "year_range": "2026",
            "files_processed": len(tasks_by_date)
        }

    except Exception as e:
        db.rollback()
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset")
async def reset_all_data(db: Session = Depends(get_db)):
    """
    Clear all tasks and sessions. Use only for recovery from data issues.
    """
    try:
        db.query(Task).delete()
        db.query(WorkSession).delete()
        db.commit()
        return {"status": "cleared", "message": "All data has been reset"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status")
async def get_upload_status(db: Session = Depends(get_db)):
    """
    Get current import status: record counts per year.
    """
    # Group tasks by year
    tasks_by_year = db.query(
        func.strftime('%Y', Task.date).label('year'),
        func.count(Task.id).label('count')
    ).group_by('year').all()

    return {
        "status": "ready",
        "records_by_year": {year: count for year, count in tasks_by_year}
    }

