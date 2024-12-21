# AImpathy - Bridging Technology and Humanity

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AImpathy**
 is a specialized tool designed for mental health professionals and individuals to interact with clinical documents, psychological assessments, and therapeutic resources using AI. Simply upload your PDF documents to explore patient cases, treatment plans, and psychological reports through meaningful, AI-driven conversations.

Perfect for:
- Psychologists and psychiatrists analyzing assessment reports
- Individuals seeking to understand their medical and psychological reports
- Therapists reviewing treatment documentation
- Mental health researchers exploring clinical studies
- Counselors accessing therapeutic resources quickly
- Clinical supervisors reviewing case notes
- Decision makers in mental health (clinic directors, program managers, policy makers)
- Social workers and case managers coordinating care
- Workplace mental health coordinators supporting employees
- AI and tech innovators advancing mental health tools

## Prerequisites

Before you begin, ensure you have the following installed:
- Python (version 3.9 or higher recommended)
- Node.js (version 16 or higher)
- npm (comes with Node.js)

## Setup Guide

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
   - On Windows:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your API key:
```env
GROQ_API_KEY=your_api_key_here
```

To get your API key:
1. Go to [groq.com](https://groq.com)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your .env file

### 2. Frontend Setup

1. Open a new terminal and navigate to the project root directory

2. Install dependencies:
```bash
npm install
```

### 3. Running the Application

1. Start the backend server (make sure your virtual environment is activated):
```bash
cd backend
python main.py
```
The backend will run on `http://localhost:8000`

2. In a new terminal, start the frontend:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`

3. Open your browser and visit `http://localhost:3000`

## Usage

1. Upload a PDF file using the paperclip icon
2. Wait for the file to process
3. Ask questions about your document
4. Use suggested prompts or type your own questions
5. Clear chat using the "Clear Chat" button when done

## Troubleshooting

Common issues and solutions:

1. "Module not found" error:
   - Make sure you've activated the virtual environment
   - Try reinstalling requirements: `pip install -r requirements.txt`

2. "API key not found" error:
   - Check if your .env file exists in the backend directory
   - Verify your API key is correct

3. "Connection refused" error:
   - Ensure both backend and frontend servers are running
   - Check if the ports 3000 and 8000 are available

For more help, please create an issue on GitHub.

## Changelog

### Version 0.1.0 (Initial Release)

Features:
- PDF document upload and processing
- Real-time chat interface with AI
- Progress tracking for file uploads
- Suggested prompts for common queries
- Formatted responses for lists and bullet points
- Session management for multiple documents
- Auto-scrolling chat interface
- File cleanup on session end

Technical Improvements:
- WebSocket integration for real-time progress updates
- Proper file cleanup in local storage
- Error handling for failed uploads
- Responsive design for better user experience

## License

MIT License

Copyright (c) 2024 AImpathy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
