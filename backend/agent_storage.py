from typing import Dict, List, Optional
from .models import Agent

class AgentStorageError(Exception):
    pass

agents: Dict[str, Agent] = {}

def get_all_agents() -> List[Agent]:
    try:
        return list(agents.values())
    except Exception as e:
        raise AgentStorageError(f"Failed to get agents: {str(e)}")

def get_agent(agent_id: str) -> Optional[Agent]:
    try:
        return agents.get(agent_id)
    except Exception as e:
        raise AgentStorageError(f"Failed to get agent {agent_id}: {str(e)}")

def add_agent(agent: Agent) -> None:
    try:
        agents[agent.id] = agent
    except Exception as e:
        raise AgentStorageError(f"Failed to add agent: {str(e)}")

def update_agent(agent: Agent) -> None:
    try:
        if agent.id not in agents:
            raise AgentStorageError(f"Agent {agent.id} not found")
        agents[agent.id] = agent
    except Exception as e:
        raise AgentStorageError(f"Failed to update agent: {str(e)}")

def delete_agent(agent_id: str) -> None:
    try:
        if agent_id in agents:
            del agents[agent_id]
    except Exception as e:
        raise AgentStorageError(f"Failed to delete agent {agent_id}: {str(e)}") 