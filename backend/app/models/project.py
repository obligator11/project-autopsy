from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    path: str
    zone: str = Field(default="autopsy")  # "autopsy" or "repodoctor"
    created_at: datetime = Field(default_factory=datetime.utcnow)