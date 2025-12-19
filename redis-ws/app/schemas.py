"""
Pydantic Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class MindUpsert(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1)
    detail: str = ""
    color: str = "#FFFFFF"
    rec_status: bool = True
    position: List[float] = [0, 0, 0]
    rotation: List[float] = [0, 0, 0]
    scale: float = 1.0


class GetMindRequest(BaseModel):
    mind_id_list: List[int]


class MindResponse(BaseModel):
    id: int
    name: str
    detail: str
    color: str
    rec_status: bool
    position: List[float]
    rotation: List[float]
    scale: float
    created_by: Optional[int] = None
    mental_sphere_ids: List[int] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class GetMindResponse(BaseModel):
    minds: List[MindResponse]
    count: int


class UpsertMindResponse(BaseModel):
    message: str
    mind: MindResponse


class MentalSphereRequest(BaseModel):
    mind_id: int
    sphere_id: List[int]


class MentalSphereResponse(BaseModel):
    message: str
    mind_id: int
    mental_sphere_ids: List[int]
