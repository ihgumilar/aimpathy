from typing import List, Optional
from models import Agent

# In-memory storage for agents (replace with database in production)
_agents: dict[str, Agent] = {}

def add_agent(agent: Agent) -> None:
    """Add an agent to storage."""
    _agents[agent.id] = agent

def get_agent(agent_id: str) -> Optional[Agent]:
    """Get an agent by ID."""
    return _agents.get(agent_id)

def get_all_agents() -> List[Agent]:
    """Get all agents."""
    return list(_agents.values())

def update_agent(agent: Agent) -> None:
    """Update an agent."""
    _agents[agent.id] = agent 