from pydantic import BaseModel
from typing import List, Optional

class AgentCreate(BaseModel):
    name: str
    role: str
    instructions: Optional[str] = None

class SubAgentCreate(BaseModel):
    name: str
    role: str
    instructions: Optional[str] = None

class TeamAgentCreate(BaseModel):
    team_name: str
    team_instructions: Optional[List[str]] = None
    agents: List[SubAgentCreate]

class Agent(BaseModel):
    id: str
    name: str
    role: str
    instructions: Optional[str] = None
    documents: List[str]
    parent_team_id: Optional[str] = None

class AgentResponse(BaseModel):
    agent_id: str
    message: str 