import React, { useState, useRef, useEffect } from 'react';

interface CreateAgentPageProps {
  onBack: () => void;
}

interface AgentDocument {
  file: File;
  name: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  instructions?: string;
  documents: string[];
}

const CreateAgentPage: React.FC<CreateAgentPageProps> = ({ onBack }) => {
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentInstructions, setAgentInstructions] = useState('');
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  // Load agents from localStorage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
    
    const savedSelectedAgents = localStorage.getItem('selectedAgents');
    if (savedSelectedAgents) {
      setSelectedAgents(new Set(JSON.parse(savedSelectedAgents)));
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocs = Array.from(files).map(file => ({
        file,
        name: file.name
      }));
      setDocuments(prev => [...prev, ...newDocs]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create new agent with mock ID
      const newAgent: Agent = {
        id: Date.now().toString(), // Use timestamp as ID
        name: agentName,
        role: agentRole,
        instructions: agentInstructions,
        documents: documents.map(doc => doc.name)
      };

      // Add to agents list
      const updatedAgents = [...agents, newAgent];
      setAgents(updatedAgents);
      
      // Save to localStorage
      localStorage.setItem('agents', JSON.stringify(updatedAgents));

      // Reset form
      setAgentName('');
      setAgentRole('');
      setAgentInstructions('');
      setDocuments([]);
      setShowForm(false);

      // Show success message
      alert('Agent created successfully!');
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
    localStorage.setItem('selectedAgents', JSON.stringify(Array.from(newSelected)));
  };

  const handleDeleteSelected = () => {
    if (selectedAgents.size === 0) {
      alert('Please select agents to delete');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedAgents.size} selected agent(s)?`
    );

    if (confirmDelete) {
      // Filter out selected agents
      const updatedAgents = agents.filter(agent => !selectedAgents.has(agent.id));
      setAgents(updatedAgents);
      
      // Clear selections
      setSelectedAgents(new Set());
      
      // Update localStorage
      localStorage.setItem('agents', JSON.stringify(updatedAgents));
      localStorage.removeItem('selectedAgents');

      alert('Selected agents deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agents</h1>
        <div className="flex gap-4">
          <button
            onClick={handleDeleteSelected}
            className={`px-4 py-2 text-white rounded-lg ${
              selectedAgents.size > 0 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={selectedAgents.size === 0}
          >
            Delete Selected
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create New Agent'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Back to Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Agents List */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Available Agents</h2>
            {agents.length === 0 ? (
              <p className="text-gray-500">No agents available. Create one to get started!</p>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div 
                    key={agent.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedAgents.has(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.role}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {agent.documents.length} document(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Area or Agent Creation Form */}
        <div className="flex-1 overflow-y-auto">
          {showForm ? (
            // Agent Creation Form
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={agentRole}
                    onChange={(e) => setAgentRole(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={agentInstructions}
                    onChange={(e) => setAgentInstructions(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents
                  </label>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Add Document
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Chat Area
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Example message - Replace with actual chat messages */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-600">
                      Select agents from the left sidebar to start chatting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgentPage; 