from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from ..models import AgentCreate, Agent, AgentResponse
from ..agent_storage import add_agent, get_all_agents, get_agent, update_agent
import uuid
import os

router = APIRouter()

# Directory to store agent documents
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "agent_documents")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/create", response_model=AgentResponse)
async def create_agent(agent_data: AgentCreate):
    try:
        print(f"Creating agent with data: {agent_data}")  # Debug log
        
        # Generate unique ID for the agent
        agent_id = str(uuid.uuid4())
        
        # Create new agent
        agent = Agent(
            id=agent_id,
            name=agent_data.name,
            role=agent_data.role,
            instructions=agent_data.instructions,
            documents=[]
        )
        
        # Store the agent
        add_agent(agent)
        print(f"Agent created successfully with ID: {agent_id}")  # Debug log
        
        return AgentResponse(
            agent_id=agent_id,
            message="Agent created successfully"
        )
    except Exception as e:
        print(f"Error creating agent: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_agents():
    try:
        agents = get_all_agents()
        return {"agents": agents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    agent_id: str = Form(...)
):
    try:
        # Create agent-specific directory
        agent_dir = os.path.join(UPLOAD_DIR, agent_id)
        os.makedirs(agent_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(agent_dir, file.filename)
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
        # Update agent's documents list
        agent = get_agent(agent_id)
        if agent:
            agent.documents.append(file.filename)
            update_agent(agent)
        
        return {"message": "Document uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 