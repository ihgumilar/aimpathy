from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body, WebSocket
from models import AgentCreate, Agent as AgentModel, TeamAgentCreate, AgentResponse
from phi.agent import Agent
from phi.knowledge.pdf import PDFKnowledgeBase
from phi.model.openai import OpenAIChat
from phi.embedder.openai import OpenAIEmbedder
from phi.vectordb.pgvector import PgVector, SearchType
from app.storage import add_agent, get_agent, get_all_agents, update_agent
import uuid
import os
from typing import Dict, Optional, List
import traceback

router = APIRouter()

# Directory to store agent documents
UPLOAD_DIR = "agent_documents"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Store agents and their knowledge bases
agent_instances: Dict[str, Agent] = {}
agent_knowledge_bases: Dict[str, PDFKnowledgeBase] = {}

# Database URL for PostgreSQL with vector extensions
DB_URL = "postgresql+psycopg://ai:ai@localhost:5532/ai"

# Initialize OpenAI components
openai_chat = OpenAIChat(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4o-mini"
)

openai_embedder = OpenAIEmbedder(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="text-embedding-3-small"
)

# Add this at the top level of the file
active_connections: Dict[str, WebSocket] = {}

# Create necessary directories
REQUIRED_DIRS = [
    "agent_documents",
    "storage"
]

for dir_path in REQUIRED_DIRS:
    os.makedirs(dir_path, exist_ok=True)

async def process_document(file_path: str, agent_id: str, send_progress) -> bool:
    """Process a document and create knowledge base for the agent."""
    try:
        print(f"Starting document processing: {file_path}")
        await send_progress(0, "Starting document processing")
        
        # Verify file exists
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            raise Exception(f"File not found: {file_path}")
            
        # Create shorter table name using first 8 chars of UUID
        short_id = agent_id.split('-')[0]
        table_name = f"agent_{short_id}_docs"
        print(f"Creating PgVector table: {table_name}")
        await send_progress(10, "Initializing database")
        
        try:
            # Initialize vector database (matching rag_agent.py format)
            vector_db = PgVector(
                table_name=table_name,
                db_url=DB_URL,
                search_type=SearchType.hybrid,
                embedder=openai_embedder
            )
            
            print("Initializing knowledge base")
            await send_progress(20, "Initializing knowledge base")
            
            # Create knowledge base
            knowledge_base = PDFKnowledgeBase(
                path=file_path,
                vector_db=vector_db
            )
            
            print("Starting document embedding")
            await send_progress(30, "Starting document embedding")
            
            # Load the document into the knowledge base
            try:
                knowledge_base.load(upsert=True)
                print("Document successfully embedded")
                await send_progress(70, "Document embedded successfully")
                    
            except Exception as embed_error:
                print(f"Embedding error: {str(embed_error)}")
                traceback.print_exc()
                raise embed_error
                
            # Store the knowledge base reference
            agent_knowledge_bases[agent_id] = knowledge_base
            print(f"Knowledge base stored for agent {agent_id}")
            await send_progress(90, "Finalizing setup")
            
            print("Document processing completed successfully")
            await send_progress(100, "Processing complete")
            return True
            
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            traceback.print_exc()
            raise db_error
            
    except Exception as e:
        print(f"Error processing document: {str(e)}")
        traceback.print_exc()
        await send_progress(0, f"Error: {str(e)}")
        return False

@router.post("/create", response_model=AgentResponse)
async def create_agent(agent_data: AgentCreate):
    try:
        # Generate unique ID for the agent
        agent_id = str(uuid.uuid4())
        
        # Create new agent
        agent = AgentModel(
            id=agent_id,
            name=agent_data.name,
            role=agent_data.role,
            instructions=agent_data.instructions,
            documents=[]
        )
        
        # Store the agent
        add_agent(agent)
        
        return AgentResponse(
            agent_id=agent_id,
            message="Agent created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    agent_id: str = Form(...),
    socket_id: Optional[str] = None
):
    try:
        print("\n=== Starting File Upload ===")
        print(f"Agent ID: {agent_id}")
        print(f"File Name: {file.filename}")
        print(f"Socket ID: {socket_id}")
        print(f"Content Type: {file.content_type}")
        
        # Define the send_progress function
        async def send_progress(progress: int, step: str):
            print(f"Progress: {progress}% - {step}")
            if socket_id and socket_id in active_connections:
                try:
                    await active_connections[socket_id].send_json({
                        "type": "progress",
                        "data": {
                            "progress": progress,
                            "step": step
                        }
                    })
                except Exception as ws_error:
                    print(f"WebSocket error: {str(ws_error)}")
            
        # Verify agent exists
        agent = get_agent(agent_id)
        if not agent:
            print(f"Error: Agent {agent_id} not found in storage")
            raise HTTPException(
                status_code=404,
                detail=f"Agent {agent_id} not found"
            )
        print(f"Found agent: {agent.name}")

        if not file.filename.lower().endswith('.pdf'):
            print("Error: File is not a PDF")
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )

        # Create agent-specific directory
        agent_dir = os.path.join(UPLOAD_DIR, agent_id)
        os.makedirs(agent_dir, exist_ok=True)
        print(f"Using directory: {agent_dir}")
        
        # Save the file
        file_path = os.path.join(agent_dir, file.filename)
        print(f"Saving file to: {file_path}")
        
        try:
            contents = await file.read()
            print(f"Read {len(contents)} bytes from upload")
            
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
            print(f"File saved successfully: {file_path}")
            
        except Exception as save_error:
            print(f"Error saving file: {str(save_error)}")
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Error saving file: {str(save_error)}"
            )
            
        # Process the document
        print("\n=== Starting Document Processing ===")
        success = await process_document(file_path, agent_id, send_progress)
        
        if success:
            print("\n=== Document Processing Successful ===")
            # Update agent's documents list
            agent.documents.append(file.filename)
            update_agent(agent)
            print(f"Updated agent {agent_id} documents: {agent.documents}")
            
            # Create Phi agent instance with knowledge base
            phi_agent = Agent(
                name=agent.name,
                role=agent.role,
                instructions=agent.instructions,
                model=openai_chat,
                add_context=True,
                search_knowledge=True,
                show_tool_calls=True,
                markdown=True
            )
            
            # Store the agent instance
            agent_instances[agent_id] = phi_agent
            
            return {
                "message": "Document processed and uploaded successfully",
                "file_name": file.filename
            }
        else:
            print("\n=== Document Processing Failed ===")
            raise HTTPException(
                status_code=500,
                detail="Failed to process document"
            )
            
    except Exception as e:
        print("\n=== Upload Error ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_agents():
    try:
        agents = get_all_agents()
        return {"agents": agents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-team", response_model=AgentResponse)
async def create_team_agent(team_data: TeamAgentCreate):
    try:
        # Generate unique ID for the team agent
        team_id = str(uuid.uuid4())
        
        # Create individual agents first
        sub_agents = []
        for agent_data in team_data.agents:
            agent_id = str(uuid.uuid4())
            
            # Create agent model
            agent = AgentModel(
                id=agent_id,
                name=agent_data.name,
                role=agent_data.role,
                instructions=agent_data.instructions,
                documents=[],
                parent_team_id=team_id
            )
            
            # Store the agent
            add_agent(agent)
            
            # Create Phi agent instance (without knowledge base initially)
            phi_agent = Agent(
                name=agent_data.name,
                role=agent_data.role,
                instructions=agent_data.instructions,
                model=openai_chat,
                add_context=True,
                search_knowledge=True,
                show_tool_calls=True,
                markdown=True
            )
            
            agent_instances[agent_id] = phi_agent
            sub_agents.append(phi_agent)
        
        # Create team agent
        team_agent = Agent(
            name=team_data.team_name,
            team=sub_agents,
            instructions=team_data.team_instructions,
            show_tool_calls=True,
            markdown=True
        )
        
        # Store team agent
        agent_instances[team_id] = team_agent
        
        return AgentResponse(
            agent_id=team_id,
            message="Team agent created successfully"
        )
        
    except Exception as e:
        print(f"Error creating team agent: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{agent_id}/query")
async def query_agent(
    agent_id: str,
    query: dict = Body(..., example={"message": "Your question here"})
):
    try:
        if not query.get("message"):
            raise HTTPException(status_code=400, detail="Query message is required")

        print(f"Received query for agent {agent_id}: {query['message']}")
        
        # Get the agent instance
        agent = agent_instances.get(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # For individual agents, ensure knowledge base is set
        agent_model = get_agent(agent_id)
        if agent_model and not agent_model.parent_team_id:
            knowledge_base = agent_knowledge_bases.get(agent_id)
            if not knowledge_base:
                raise HTTPException(
                    status_code=404,
                    detail="Knowledge base not initialized. Please upload a document first."
                )
            agent.knowledge_base = knowledge_base
        
        # Get response
        response = agent.run(query["message"])
        
        if not response:
            raise Exception("No response received from agent")
            
        return {
            "response": response,
            "agent_id": agent_id
        }
            
    except Exception as e:
        print(f"Query error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Update the WebSocket endpoint
@router.websocket("/ws/{socket_id}")
async def websocket_endpoint(websocket: WebSocket, socket_id: str):
    print(f"New WebSocket connection request: {socket_id}")
    await websocket.accept()
    active_connections[socket_id] = websocket
    print(f"WebSocket connection accepted: {socket_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message from socket {socket_id}: {data}")
    except Exception as e:
        print(f"WebSocket error for {socket_id}: {str(e)}")
    finally:
        if socket_id in active_connections:
            del active_connections[socket_id]
        print(f"WebSocket connection closed: {socket_id}") 

@router.get("/test")
async def test_endpoint():
    print("Test endpoint called")
    return {"message": "Backend is working"} 