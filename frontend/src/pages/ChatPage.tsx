import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatPage() {
    const [messages, setMessages] = useState<Array<{type: string, content: string}>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const socketId = useRef(Math.random().toString(36).substring(7));
    const [selectedAgent, setSelectedAgent] = useState<string>('');

    useEffect(() => {
        console.log('ChatPage mounted');
        return () => {
            console.log('ChatPage unmounted');
        };
    }, []);

    useEffect(() => {
        const ws = wsRef.current;
        const interval = setInterval(() => {
            if (ws) {
                console.log('WebSocket state:', ws.readyState);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log('Connecting to WebSocket...');
        wsRef.current = new WebSocket(`ws://localhost:8000/agents/ws/${socketId.current}`);
        
        wsRef.current.onopen = () => {
            console.log('WebSocket Connected');
            setUploadStatus('WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            if (data.type === 'progress') {
                setUploadProgress(data.data.progress);
                setUploadStatus(data.data.step);
                console.log(`Progress: ${data.data.progress}% - ${data.data.step}`);
            }
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setUploadStatus('WebSocket error occurred');
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket connection closed');
            setUploadStatus('WebSocket disconnected');
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        const agentId = 'your_agent_id_here'; // Replace with actual agent ID source
        setSelectedAgent(agentId);
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadProgress(0);
        setUploadStatus('Starting upload...');
        console.log('Starting file upload...');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('agent_id', selectedAgent);
        formData.append('socket_id', socketId.current);

        try {
            setIsLoading(true);
            console.log('Sending upload request...');
            const response = await axios.post('http://localhost:8000/agents/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Upload response:', response.data);
            setUploadStatus('Upload completed successfully');
            setMessages(prev => [...prev, { 
                type: 'system', 
                content: `Document uploaded successfully: ${response.data.message}` 
            }]);
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus(`Upload failed: ${error.response?.data?.detail || error.message}`);
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: `Error uploading document: ${error.response?.data?.detail || error.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        try {
            setIsLoading(true);
            console.log('Sending query:', input);
            setMessages(prev => [...prev, { type: 'user', content: input }]);

            const response = await axios.post(`http://localhost:8000/agents/${selectedAgent}/query`, {
                message: input
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Query response:', response.data);

            if (response.data && response.data.response) {
                setMessages(prev => [...prev, { 
                    type: 'agent', 
                    content: response.data.response 
                }]);
            } else {
                throw new Error('Invalid response format');
            }
            
            setInput('');
        } catch (error: any) {
            console.error('Query error:', error);
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: `Error: ${error.response?.data?.detail || error.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <div className="mb-2">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="mb-2"
                    />
                    <div className="text-sm text-gray-600">
                        Status: {uploadStatus}
                    </div>
                </div>
                
                {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded">
                        <div
                            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            {uploadProgress}%
                        </div>
                    </div>
                )}
            </div>

            <div className="h-[500px] overflow-y-auto border rounded p-4 mb-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded ${
                            message.type === 'user' ? 'bg-blue-100 ml-auto' : 
                            message.type === 'agent' ? 'bg-gray-100' :
                            message.type === 'error' ? 'bg-red-100' : 'bg-green-100'
                        }`}
                    >
                        {message.content}
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
} 