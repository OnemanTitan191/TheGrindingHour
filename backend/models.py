"""
SQLAlchemy models for labor tracking
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Date
from sqlalchemy.sql import func
from database import Base

class WorkSession(Base):
    """Work session model"""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True), nullable=True)
    total_hours = Column(Float, default=0.0)
    total_rate = Column(Float, default=0.0)
    attendance_hours = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Task(Base):
    """Individual task/labor entry"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(Text)
    hours = Column(Float, nullable=False)
    flag_hours = Column(Float, default=0.0)
    hourly_rate = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    pay_type = Column(String, default="cp")
    opcode = Column(String, default="OTHER")
    source = Column(String, default="tekion", nullable=False)
    ro_number = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LaborRate(Base):
    """Tiered hourly rate schedule — rate applies from effective_date onward"""
    __tablename__ = "labor_rates"

    id = Column(Integer, primary_key=True, index=True)
    effective_date = Column(Date, nullable=False)
    rate = Column(Float, nullable=False)
    notes = Column(String, nullable=True)

class Export(Base):
    """Export records for backup/archive"""
    __tablename__ = "exports"

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    format = Column(String, default="csv")
    session_count = Column(Integer, default=0)
    task_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
