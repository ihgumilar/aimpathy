from pydantic import BaseModel
from typing import Optional, List

class AgentCreate(BaseModel):
    name: str
    role: str
    instructions: Optional[str] = None

class Agent(BaseModel):
    id: str
    name: str
    role: str
    instructions: Optional[str] = None
    documents: List[str] = [] 