"""
Dashboard statistics endpoints for labor tracking
Provides YTD summaries, weekly/monthly breakdowns, pay type analysis, income projections, and historical trends
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date
from typing import List, Optional
from decimal import Decimal
import math
from database import get_db
from models import Task

router = APIRouter(prefix="/stats", tags=["stats"])

# Helper functions for date handling and calculations

def get_iso_week(date_obj: date) -> tuple[int, int]:
    """Get ISO year and week number from a date"""
    return date_obj.isocalendar()[:2]

def get_year_start_end(year: int) -> tuple[date, date]:
    """Get start and end dates for a given year"""
    return date(year, 1, 1), date(year, 12, 31)

def parse_iso_week(week_str: str) -> tuple[int, int]:
    """Parse ISO week string (YYYY-WXX) to year and week number"""
    parts = week_str.split("-W")
    return int(parts[0]), int(parts[1])

def get_week_dates(year: int, week: int) -> tuple[date, date]:
    """Get start and end dates for a given ISO week"""
    jan4 = date(year, 1, 4)
    week_one_monday = jan4 - timedelta(days=jan4.weekday())
    monday = week_one_monday + timedelta(weeks=week - 1)
    sunday = monday + timedelta(days=6)
    return monday, sunday

def calculate_efficiency(flag_hours: float, actual_hours: float) -> float:
    """Calculate efficiency percentage (flag_hours / actual_hours)"""
    if actual_hours == 0:
        return 0.0
    return round(flag_hours / actual_hours, 2)

def get_hourly_rate(entry_date: Optional[date] = None) -> float:
    """Get the hourly rate for calculations based on date.

    Tiered rates by date:
    - 11/2020 - 06/2022: $24.00/hr
    - 07/2022 - 01/2024: $32.00/hr
    - 01/2024 - 04/2026: $36.00/hr
    - 05/2026 - current: $37.50/hr
    """
    if entry_date is None:
        entry_date = date.today()

    if entry_date < date(2022, 7, 1):
        return 24.0
    elif entry_date < date(2024, 1, 1):
        return 32.0
    elif entry_date < date(2026, 5, 1):
        return 36.0
    else:
        return 37.5

# Task 1: YTD Summary Endpoint

@router.get("/summary")
async def get_ytd_summary(year: int = Query(...), db: Session = Depends(get_db)):
    """
    GET /stats/summary?year=2026
    Returns YTD totals including flag hours, actual hours, efficiency, RO count, days worked
    """
    start_date, end_date = get_year_start_end(year)

    # Query all tasks for the year
    tasks = db.query(Task).filter(
        and_(
            func.date(Task.date) >= start_date,
            func.date(Task.date) <= end_date
        )
    ).all()

    if not tasks:
        return {
            "year": year,
            "flag_hours_ytd": 0.0,
            "actual_hours_ytd": 0.0,
            "ro_count_ytd": 0,
            "efficiency_pct_ytd": 0.0,
            "days_worked_ytd": 0,
            "income_projection_ytd": 0.0,
            "target_flag_hours": 2000,
            "progress_pct": 0.0
        }

    flag_hours_ytd = sum(getattr(t, 'flag_hours', t.hours) for t in tasks)
    actual_hours_ytd = sum(t.hours for t in tasks)
    ro_count_ytd = len(tasks)
    efficiency_pct_ytd = calculate_efficiency(flag_hours_ytd, actual_hours_ytd)

    unique_dates = set(func.date(t.date) for t in tasks)
    days_worked_ytd = len(unique_dates)

    # Calculate YTD income using date-based tiered rates
    income_projection_ytd = 0.0
    for task in tasks:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        task_flag_hours = getattr(task, 'flag_hours', task.hours)
        task_rate = get_hourly_rate(task_date)
        income_projection_ytd += task_flag_hours * task_rate

    target_flag_hours = 2000
    progress_pct = round((flag_hours_ytd / target_flag_hours) * 100, 1)

    return {
        "year": year,
        "flag_hours_ytd": round(flag_hours_ytd, 1),
        "actual_hours_ytd": round(actual_hours_ytd, 1),
        "ro_count_ytd": ro_count_ytd,
        "efficiency_pct_ytd": efficiency_pct_ytd,
        "days_worked_ytd": days_worked_ytd,
        "income_projection_ytd": round(income_projection_ytd, 2),
        "target_flag_hours": target_flag_hours,
        "progress_pct": progress_pct
    }

# Task 2: Weekly Breakdown Endpoint

@router.get("/weekly")
async def get_weekly_breakdown(week: str = Query(...), db: Session = Depends(get_db)):
    """
    GET /stats/weekly?week=2026-W20
    Returns 7-day breakdown for the specified ISO week with pay type split
    """
    year, week_num = parse_iso_week(week)
    monday, sunday = get_week_dates(year, week_num)

    # Query tasks for the week
    tasks = db.query(Task).filter(
        and_(
            func.date(Task.date) >= monday,
            func.date(Task.date) <= sunday
        )
    ).order_by(Task.date).all()

    # Group tasks by date
    daily_data = {}
    for i in range(7):
        current_date = monday + timedelta(days=i)
        daily_data[current_date] = {
            "date": current_date.isoformat(),
            "flag_hours": 0.0,
            "actual_hours": 0.0,
            "ro_count": 0,
            "cp_hours": 0.0,
            "wp_hours": 0.0,
            "ip_hours": 0.0,
        }

    for task in tasks:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        if task_date in daily_data:
            flag_hours = getattr(task, 'flag_hours', task.hours)
            pay_type = getattr(task, 'pay_type', 'cp').lower()

            daily_data[task_date]['flag_hours'] += flag_hours
            daily_data[task_date]['actual_hours'] += task.hours
            daily_data[task_date]['ro_count'] += 1

            if pay_type == 'cp':
                daily_data[task_date]['cp_hours'] += flag_hours
            elif pay_type == 'wp':
                daily_data[task_date]['wp_hours'] += flag_hours
            elif pay_type == 'ip':
                daily_data[task_date]['ip_hours'] += flag_hours

    # Calculate efficiency and week delta
    result = []
    prev_day_flag = 0.0
    for current_date in sorted(daily_data.keys()):
        day_data = daily_data[current_date]
        efficiency = calculate_efficiency(day_data['flag_hours'], day_data['actual_hours'])
        week_delta = day_data['flag_hours'] - prev_day_flag

        result.append({
            "date": day_data['date'],
            "flag_hours": round(day_data['flag_hours'], 1),
            "actual_hours": round(day_data['actual_hours'], 1),
            "efficiency_pct": efficiency,
            "ro_count": day_data['ro_count'],
            "cp_hours": round(day_data['cp_hours'], 1),
            "wp_hours": round(day_data['wp_hours'], 1),
            "ip_hours": round(day_data['ip_hours'], 1),
            "week_delta": round(week_delta, 1)
        })
        prev_day_flag = day_data['flag_hours']

    return result

# Task 3: Monthly Breakdown Endpoint

@router.get("/monthly")
async def get_monthly_breakdown(year: int = Query(...), db: Session = Depends(get_db)):
    """
    GET /stats/monthly?year=2026
    Returns 12-month aggregation with pay type amounts and efficiency
    """
    start_date, end_date = get_year_start_end(year)

    # Query all tasks for the year
    tasks = db.query(Task).filter(
        and_(
            func.date(Task.date) >= start_date,
            func.date(Task.date) <= end_date
        )
    ).all()

    month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']

    # Initialize month data
    monthly_data = {}
    for month in range(1, 13):
        monthly_data[month] = {
            "month": month_names[month - 1],
            "flag_hours": 0.0,
            "actual_hours": 0.0,
            "cp_amount": 0.0,
            "wp_amount": 0.0,
            "ip_amount": 0.0,
        }

    # Aggregate tasks by month
    for task in tasks:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        month = task_date.month

        flag_hours = getattr(task, 'flag_hours', task.hours)
        pay_type = getattr(task, 'pay_type', 'cp').lower()
        task_rate = get_hourly_rate(task_date)
        amount = flag_hours * task_rate

        monthly_data[month]['flag_hours'] += flag_hours
        monthly_data[month]['actual_hours'] += task.hours

        if pay_type == 'cp':
            monthly_data[month]['cp_amount'] += amount
        elif pay_type == 'wp':
            monthly_data[month]['wp_amount'] += amount
        elif pay_type == 'ip':
            monthly_data[month]['ip_amount'] += amount

    # Build result with efficiency
    result = {
        "year": year,
        "months": []
    }

    for month in range(1, 13):
        data = monthly_data[month]
        efficiency = calculate_efficiency(data['flag_hours'], data['actual_hours'])

        result['months'].append({
            "month": data['month'],
            "flag_hours": round(data['flag_hours'], 1),
            "actual_hours": round(data['actual_hours'], 1),
            "efficiency_pct": efficiency,
            "cp_amount": round(data['cp_amount'], 2),
            "wp_amount": round(data['wp_amount'], 2),
            "ip_amount": round(data['ip_amount'], 2)
        })

    return result

# Task 4: Pay Type Breakdown Endpoint

@router.get("/pay-types")
async def get_pay_types(year: int = Query(...), db: Session = Depends(get_db)):
    """
    GET /stats/pay-types?year=2026
    Returns breakdown by pay type (Customer Pay, Warranty, Internal)
    """
    start_date, end_date = get_year_start_end(year)

    tasks = db.query(Task).filter(
        and_(
            func.date(Task.date) >= start_date,
            func.date(Task.date) <= end_date
        )
    ).all()

    # Initialize pay type data
    pay_types_data = {
        'cp': {'pay_type': 'Customer Pay', 'flag_hours': 0.0, 'actual_hours': 0.0, 'amount': 0.0},
        'wp': {'pay_type': 'Warranty', 'flag_hours': 0.0, 'actual_hours': 0.0, 'amount': 0.0},
        'ip': {'pay_type': 'Internal', 'flag_hours': 0.0, 'actual_hours': 0.0, 'amount': 0.0}
    }

    # Aggregate by pay type
    for task in tasks:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        pay_type = getattr(task, 'pay_type', 'cp').lower()
        flag_hours = getattr(task, 'flag_hours', task.hours)

        if pay_type not in pay_types_data:
            pay_type = 'cp'

        task_rate = get_hourly_rate(task_date)
        pay_types_data[pay_type]['flag_hours'] += flag_hours
        pay_types_data[pay_type]['actual_hours'] += task.hours
        pay_types_data[pay_type]['amount'] += flag_hours * task_rate

    # Build result
    result = {
        "year": year,
        "pay_types": []
    }

    for key in ['cp', 'wp', 'ip']:
        data = pay_types_data[key]
        efficiency = calculate_efficiency(data['flag_hours'], data['actual_hours'])

        result['pay_types'].append({
            "pay_type": data['pay_type'],
            "flag_hours": round(data['flag_hours'], 1),
            "actual_hours": round(data['actual_hours'], 1),
            "efficiency_pct": efficiency,
            "amount": round(data['amount'], 2)
        })

    return result

# Task 5: Income Projection Endpoint

@router.get("/income")
async def get_income_projection(year: int = Query(...), db: Session = Depends(get_db)):
    """
    GET /stats/income?year=2026
    Returns current period projection and semi-monthly rate calculations
    """
    today = date.today()
    year_start, _ = get_year_start_end(year)

    # Get current period (semi-monthly: 1-15 or 16-end)
    if today.day <= 15:
        period_start = date(today.year, today.month, 1)
        period_end = date(today.year, today.month, 15)
    else:
        period_start = date(today.year, today.month, 16)
        month_end = date(today.year, today.month, 28)
        if month_end.month != today.month:
            month_end -= timedelta(days=1)
        while month_end.month == today.month:
            month_end += timedelta(days=1)
        period_end = month_end - timedelta(days=1)

    # Query year-to-date tasks
    tasks_ytd = db.query(Task).filter(
        and_(
            func.date(Task.date) >= year_start,
            func.date(Task.date) <= today
        )
    ).all()

    # Query current period tasks
    tasks_current = [t for t in tasks_ytd
                     if period_start <= (t.date.date() if hasattr(t.date, 'date') else t.date) <= period_end]

    # Current period calculations using per-task rates
    current_period_flag_hours = 0.0
    current_period_projection = 0.0
    for task in tasks_current:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        task_flag_hours = getattr(task, 'flag_hours', task.hours)
        task_rate = get_hourly_rate(task_date)
        current_period_flag_hours += task_flag_hours
        current_period_projection += task_flag_hours * task_rate

    # Calculate weighted average hourly rate for YTD
    ytd_total_income = 0.0
    ytd_total_flag_hours = 0.0
    for task in tasks_ytd:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        task_flag_hours = getattr(task, 'flag_hours', task.hours)
        task_rate = get_hourly_rate(task_date)
        ytd_total_income += task_flag_hours * task_rate
        ytd_total_flag_hours += task_flag_hours

    # Weighted average rate (use for projections)
    weighted_avg_rate = ytd_total_income / ytd_total_flag_hours if ytd_total_flag_hours > 0 else 0.0

    # Days elapsed in year
    days_elapsed = (today - year_start).days + 1

    # Semi-monthly rate calculation using weighted average rate
    if days_elapsed > 0:
        avg_daily_flag = ytd_total_flag_hours / days_elapsed
        semi_monthly_rate = avg_daily_flag * 15 * weighted_avg_rate
        monthly_projection = semi_monthly_rate * 2
    else:
        semi_monthly_rate = 0.0
        monthly_projection = 0.0

    # Peak weekly hours and 12-week rolling average
    all_flag_hours = [getattr(t, 'flag_hours', t.hours) for t in tasks_ytd]
    peak_weekly = max(all_flag_hours) if all_flag_hours else 0.0
    best_case = peak_weekly * 4.33 * weighted_avg_rate

    # 12-week rolling average
    if len(all_flag_hours) >= 12:
        conservative_avg = sum(all_flag_hours[-12:]) / 12
    elif all_flag_hours:
        conservative_avg = sum(all_flag_hours) / len(all_flag_hours)
    else:
        conservative_avg = 0.0

    conservative_case = conservative_avg * 4.33 * weighted_avg_rate

    return {
        "year": year,
        "current_period": f"{period_start.isoformat()} to {period_end.isoformat()}",
        "current_period_flag_hours": round(current_period_flag_hours, 1),
        "current_period_projection": round(current_period_projection, 2),
        "semi_monthly_rate": round(semi_monthly_rate, 2),
        "monthly_projection": round(monthly_projection, 2),
        "best_case": round(best_case, 2),
        "conservative_case": round(conservative_case, 2)
    }

# Task 6: Year-over-Year Historical Endpoint

@router.get("/historical")
async def get_historical(db: Session = Depends(get_db)):
    """
    GET /stats/historical
    Returns all years with YTD summaries, sorted descending by year
    """
    tasks = db.query(Task).all()

    if not tasks:
        return {"years": []}

    # Group tasks by year
    years_data = {}
    for task in tasks:
        task_date = task.date.date() if hasattr(task.date, 'date') else task.date
        year = task_date.year

        if year not in years_data:
            years_data[year] = {
                "flag_hours": 0.0,
                "actual_hours": 0.0,
                "ro_count": 0
            }

        flag_hours = getattr(task, 'flag_hours', task.hours)
        years_data[year]['flag_hours'] += flag_hours
        years_data[year]['actual_hours'] += task.hours
        years_data[year]['ro_count'] += 1

    # Build result, sorted descending
    result = {"years": []}
    for year in sorted(years_data.keys(), reverse=True):
        data = years_data[year]
        efficiency = calculate_efficiency(data['flag_hours'], data['actual_hours'])

        result['years'].append({
            "year": year,
            "flag_hours_ytd": round(data['flag_hours'], 1),
            "ro_count_ytd": data['ro_count'],
            "efficiency_pct_ytd": efficiency
        })

    return result

# Task 7: Category/Opcode Breakdown Endpoint

@router.get("/category")
async def get_category_breakdown(year: int = Query(...), db: Session = Depends(get_db)):
    """
    GET /stats/category?year=2026
    Returns breakdown by opcode/service category
    """
    start_date, end_date = get_year_start_end(year)

    tasks = db.query(Task).filter(
        and_(
            func.date(Task.date) >= start_date,
            func.date(Task.date) <= end_date
        )
    ).all()

    # Group by opcode
    opcode_data = {}
    for task in tasks:
        opcode = getattr(task, 'opcode', 'OTHER')

        if opcode not in opcode_data:
            opcode_data[opcode] = {
                "flag_hours": 0.0,
                "actual_hours": 0.0,
                "count": 0
            }

        flag_hours = getattr(task, 'flag_hours', task.hours)
        opcode_data[opcode]['flag_hours'] += flag_hours
        opcode_data[opcode]['actual_hours'] += task.hours
        opcode_data[opcode]['count'] += 1

    # Build result, sorted by opcode
    result = {
        "year": year,
        "categories": []
    }

    for opcode in sorted(opcode_data.keys()):
        data = opcode_data[opcode]
        efficiency = calculate_efficiency(data['flag_hours'], data['actual_hours'])

        result['categories'].append({
            "opcode": opcode,
            "flag_hours": round(data['flag_hours'], 1),
            "actual_hours": round(data['actual_hours'], 1),
            "efficiency_pct": efficiency,
            "count": data['count']
        })

    return result

# Task 8: Date Filtering (implemented across all endpoints)
# All endpoints support year parameter, weekly supports week=YYYY-WXX
# Empty results return empty arrays, not errors
