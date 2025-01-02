from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from phi.assistant import Assistant

router = APIRouter()

class AgentCreate(BaseModel):
    name: str
    role: str
    task: str
    instructions: str

@router.post("/create")
async def create_agent(agent_data: AgentCreate):
    try:
        # Create a new assistant using phi
        assistant = Assistant(
            name=agent_data.name,
            description=agent_data.role,
            instructions=[agent_data.instructions],
            # Add any additional configuration needed
        )
        
        # You might want to store the assistant configuration in a database
        # For now, we'll just return success
        return {"status": "success", "message": "Agent created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 