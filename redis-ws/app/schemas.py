"""
Pydantic Schemas
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


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


class MentalSphereUpsert(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1)
    detail: str = ""
    color: str = "#FFFFFF"
    image: str = ""
    rec_status: bool = True
    position: List[float] = [0, 0, 0]
    rotation: List[float] = [0, 0, 0]
    scale: float = 1.0


class MentalSphereResponseData(BaseModel):
    id: int
    name: str
    detail: str
    color: str
    image: str
    rec_status: bool
    position: List[float]
    rotation: List[float]
    scale: float
    created_by: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UpsertMentalSphereResponse(BaseModel):
    message: str
    mental_sphere: MentalSphereResponseData


class MentalContext(BaseModel):
    """Mental conditioning context"""
    mindfulness_present: bool = False
    latent_tendencies: List[str] = []
    training_level: Literal["worldling", "sekha", "arahant"] = "worldling"
    
    class Config:
        json_schema_extra = {
            "example": {
                "mindfulness_present": False,
                "latent_tendencies": ["greed", "delusion"],
                "training_level": "worldling"
            }
        }


class ExperienceInput(BaseModel):
    mind_id: int = Field(..., description="ID of the mind experiencing")
    sense_door: Literal["eye", "ear", "nose", "tongue", "body", "mind"] = Field(
        ..., description="Which sense door the experience comes through"
    )
    obj: str = Field(..., description="What is experienced (e.g., 'blue form', 'loud sound', 'angry thought')")
    feeling_potential: Literal["pleasant", "unpleasant", "neutral"] = Field(
        ..., description="Hedonic potential of the object"
    )
    mental_context: MentalContext = Field(..., description="Current mental conditioning")
    
    class Config:
        json_schema_extra = {
            "example": {
                "mind_id": 1,
                "sense_door": "eye",
                "obj": "beautiful flower",
                "feeling_potential": "pleasant",
                "mental_context": {
                    "mindfulness_present": False,
                    "latent_tendencies": ["greed"],
                    "training_level": "worldling"
                }
            }
        }


class NonKammicStage(BaseModel):
    contact: str  # Sense door + object + consciousness
    feeling: Literal["pleasant", "unpleasant", "neutral"]
    perception: str  # Recognition/interpretation of object


class JavanaResult(BaseModel):
    roots: List[str]  # e.g., ["lobha"], ["alobha", "adosa", "amoha"], ["kiriya"]
    volition_type: Literal["kusala", "akusala", "kiriya"]
    cetasikas_instantiated: List[str]
    kamma_produced: Literal["kusala_kamma", "akusala_kamma", "no_kamma"]
    kamma_potency: Optional[int] = None  # 1-10 scale for kusala/akusala


class ExperienceResult(BaseModel):
    experience_id: int
    mind_id: int
    sense_door: str
    object_experienced: str
    feeling_potential: str
    
    non_kammic_stage: NonKammicStage
    javana_result: JavanaResult
    
    created_at: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "experience_id": 1,
                "mind_id": 1,
                "sense_door": "eye",
                "object_experienced": "beautiful flower",
                "feeling_potential": "pleasant",
                "non_kammic_stage": {
                    "contact": "eye + beautiful flower + visual consciousness",
                    "feeling": "pleasant",
                    "perception": "recognized as desirable flower"
                },
                "javana_result": {
                    "roots": ["lobha", "moha"],
                    "volition_type": "akusala",
                    "cetasikas_instantiated": ["greed", "delusion", "restlessness"],
                    "kamma_produced": "akusala_kamma",
                    "kamma_potency": 6
                },
                "created_at": "2026-01-30T10:00:00"
            }
        }


class ProcessExperienceResponse(BaseModel):
    """Response from experience endpoint"""
    message: str
    experience: ExperienceResult


class ExecuteCodeRequest(BaseModel):
    code: str = Field(...)

    class Config:
        json_schema_extra = {
            "example": {
                "code": 'x = Mind()\nx.name = "mind1"\nx.color = "#fe0000"\n\ny = Mind()\ny.detail = "test"\n\nz = Mental()\nz.name = "mental1"\ny.append(z)'
            }
        }


class ExecuteCodeResponse(BaseModel):
    message: str
    created_minds: List[dict]
    created_mentals: List[dict]
    execution_log: List[str]
    summary: dict


# ---------------------------------------------------------------------------
# Static Abhidhamma reference data
# ---------------------------------------------------------------------------

class StaticMentalResponse(BaseModel):
    id: int
    name: str
    pali: str
    thai: str
    slug: str
    category: str
    description: str
    characteristic: str = ''
    function: str = ''
    manifestation: str = ''
    proximate_cause: str = ''


class StaticMentalListResponse(BaseModel):
    mentals: List[StaticMentalResponse]
    count: int


class StaticMentalGroupResponse(BaseModel):
    id: int
    name: str
    name_thai: str
    name_en: str
    description: str = ''
    mental_ids: List[int]


class StaticMentalGroupListResponse(BaseModel):
    mental_groups: List[StaticMentalGroupResponse]
    count: int


class StaticMindResponse(BaseModel):
    id: int
    name: str
    name_en: str = ''
    pali: str
    thai: str
    category: str
    subgroup: str = ''
    description: str = ''
    description_thai: str = ''
    mental_ids: List[int]


class StaticMindListResponse(BaseModel):
    minds: List[StaticMindResponse]
    count: int


class StaticMindGroupResponse(BaseModel):
    id: int
    name: str
    name_thai: str
    name_en: str
    description: str = ''
    mind_ids: List[int]


class StaticMindGroupListResponse(BaseModel):
    mind_groups: List[StaticMindGroupResponse]
    count: int


# ---------------------------------------------------------------------------
# Pancadvara Vithi (Five-door cognitive process)
# ---------------------------------------------------------------------------

class VithiEventResponse(BaseModel):
    order: int
    stage: str
    mind_id: Optional[int] = None
    mind_id_range: Optional[List[int]] = None
    mind_name: Optional[str] = None
    description: str


class PancadvaraVithiRequest(BaseModel):
    sense: str
    desire: str
    vividity: str
    person_type: str = "puthujjana"
    yoniso_manasikara: bool = False
    anusaya_dosa: float = 0.3
    anusaya_lobha: float = 0.2
    experience_weight: Optional[dict] = None

    class Config:
        json_schema_extra = {
            "example": {
                "sense": "eye",
                "desire": "good",
                "vividity": "atimahantarammana",
                "person_type": "puthujjana",
                "yoniso_manasikara": False,
                "anusaya_dosa": 0.3,
                "anusaya_lobha": 0.2,
                "experience_weight": {}
            }
        }


class PancadvaraVithiResponse(BaseModel):
    message: str
    events: List[VithiEventResponse]
    updated_experience_weight: dict
    summary: dict


'''
[ Request ]
  ├─ senseDoor
  ├─ object
  └─ mentalContext
        ↓
[ Phassa Middleware ]  (neutral)
        ↓
[ Vedana Middleware ] (neutral)
        ↓
[ Sanna Middleware ]  (neutral)
        ↓
[ Javana Engine ]
        ├─ evaluate roots
        └─ then, classify consciousness
        
[ Result ]
  ├─ kusala / akusala / kiriya
  └─ kamma generated? yes/no
'''