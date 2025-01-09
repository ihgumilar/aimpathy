import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Agent {
  id: string;
  name: string;
  role: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: () => void;
  onDeleteAgents: (agentIds: string[]) => void;
}

export default function Sidebar({ isOpen, onClose, onCreateAgent, onDeleteAgents }: SidebarProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Fetch agents when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents/list`);
      console.log("Fetched agents:", response.data);
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedAgents.length === 0) return;

    try {
      console.log("Deleting agents:", selectedAgents);
      await onDeleteAgents(selectedAgents);
      setSelectedAgents([]);
      await fetchAgents(); // Refresh the list
    } catch (error) {
      console.error('Error in handleDeleteSelected:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          <h2 className="text-xl font-bold mb-6">Agents</h2>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onCreateAgent}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create New
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedAgents.length === 0}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              Delete ({selectedAgents.length})
            </button>
          </div>

          {/* Agents List */}
          <div className="mt-4 space-y-2">
            {agents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center p-2 hover:bg-gray-100 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent.id)}
                  onChange={() => handleAgentSelect(agent.id)}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-gray-500">{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 