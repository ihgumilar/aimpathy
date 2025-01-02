from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import agents, files

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(router=agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(router=files.router, prefix="/api/files", tags=["files"]) 