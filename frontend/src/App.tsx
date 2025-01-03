import React, { useState, useRef } from 'react';
import AgentCreationModal from './components/AgentCreationModal';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import CreateAgentPage from './pages/CreateAgentPage';

interface PromptMessage {
  type: string;
  text: string;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'main' | 'chat' | 'create-agent'>('main');

  const handleCardClick = (type: string) => {
    let promptText = '';
    switch (type) {
      case 'clinical':
        promptText = 'Summarize the key clinical findings and diagnoses';
        break;
      case 'treatment':
        promptText = 'List the recommended treatment approaches';
        break;
      case 'symptoms':
        promptText = 'Extract the main symptoms and behavioral patterns';
        break;
      case 'risk':
        promptText = 'Identify risk factors and protective factors';
        break;
    }
    setMessage(promptText);
  };

  const handleCreateAgent = () => {
    setIsSidebarOpen(false);
    setCurrentPage('create-agent');
  };

  const handleBackToMain = () => {
    setCurrentPage('main');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && file.type === 'application/pdf') {
      await handleFileUploadProcess(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleFileUploadProcess = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Connect to WebSocket for progress updates
      const ws = new WebSocket('ws://localhost:8000/api/ws');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setUploadProgress(data.progress || 0);
      };

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setShowChat(true);
      console.log('Upload successful:', data);
      setUploadProgress(100);
      
      // Navigate to chat page after successful upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleFileUploadProcess(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !message) {
      alert('Please upload a file and type a message');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('query', message);

      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Query failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        setResponse(''); // Clear previous response
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(5);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setResponse(prev => (prev || '') + parsed.content);
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }

      setMessage('');
    } catch (error) {
      console.error('Error querying document:', error);
      alert(error instanceof Error ? error.message : 'Failed to process query');
    }
  };

  const handleReset = () => {
    setSessionId(null);
    setShowChat(false);
    setSelectedFile(null);
  };

  if (currentPage === 'create-agent') {
    return <CreateAgentPage onBack={handleBackToMain} />;
  }

  if (showChat && sessionId) {
    return (
      <ChatPage 
        sessionId={sessionId} 
        onReset={handleReset}
        fileName={selectedFile?.name}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Header Section - Only Hamburger */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20">
        <div className="container mx-auto px-4 py-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* File Upload Section */}
        <div className="text-center mb-8">
          <a 
            href="https://www.aimpathy.co.nz/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-3xl font-bold"
          >
            <span className="text-red-500">AI</span>
            <span className="text-black">mpathy</span>
          </a>
          <p className="text-xl mb-4">Bridging Technology and Humanity</p>
          <p className="text-gray-600 mb-6">
            Upload your PDF file first, then select a prompt below to begin or enter your own text.
          </p>
          <div className="max-w-xl mx-auto">
            <div 
              className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center">
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Processing... {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          stroke="currentColor"
                        />
                      </svg>
                    </div>
                    <div className="text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept=".pdf"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PDF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Clinical Findings Card */}
          <div 
            onClick={() => handleCardClick('clinical')}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <span className="text-blue-500 mr-2">📝</span>
              <h2 className="text-lg font-semibold">Summarize the key clinical findings and diagnoses</h2>
            </div>
          </div>

          {/* Treatment Approaches Card */}
          <div 
            onClick={() => handleCardClick('treatment')}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <span className="text-green-500 mr-2">✓</span>
              <h2 className="text-lg font-semibold">List the recommended treatment approaches</h2>
            </div>
          </div>

          {/* Symptoms Card */}
          <div 
            onClick={() => handleCardClick('symptoms')}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <span className="text-purple-500 mr-2">🔍</span>
              <h2 className="text-lg font-semibold">Extract the main symptoms and behavioral patterns</h2>
            </div>
          </div>

          {/* Risk Factors Card */}
          <div 
            onClick={() => handleCardClick('risk')}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 mr-2">🧩</span>
              <h2 className="text-lg font-semibold">Identify risk factors and protective factors</h2>
            </div>
          </div>
        </div>

        {/* Response Section */}
        {response && (
          <div className="max-w-3xl mx-auto mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-700">{response}</p>
            </div>
          </div>
        )}

        {/* Message Input Section */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600"
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </main>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateAgent={handleCreateAgent}
      />

      {/* Agent Creation Modal */}
      <AgentCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAgent}
      />
    </div>
  );
}

export default App; 