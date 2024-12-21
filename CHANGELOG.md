# Changelog

All notable changes to AImpathy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-03-14

### Added
- Initial release of AImpathy
- PDF document upload functionality
- Real-time chat interface with AI using Groq
- WebSocket integration for upload progress tracking
- Suggested prompts for common document queries
- Auto-scrolling chat interface
- Session management system
- File cleanup system for uploaded documents
- Response formatting for lists and bullet points
- Error handling for failed uploads
- Responsive design for various screen sizes

### Technical Details
#### Backend
- FastAPI server with WebSocket support
- PDF processing using llama-index
- Integration with Groq LLM API
- Automatic file cleanup system
- Session-based document management
- Real-time progress updates

#### Frontend
- Next.js 14 application
- Real-time WebSocket communication
- Tailwind CSS for styling
- Custom message formatting
- Progress bar with status updates
- File attachment handling
- Auto-scrolling message container

### Dependencies
- Python 3.9+
- Node.js 16+
- FastAPI
- llama-index
- Groq API
- Next.js
- Tailwind CSS

### Known Issues
- None at this time

### Security
- API key management through .env file
- Secure WebSocket connections
- Proper file cleanup after sessions end

[0.1.0]: https://github.com/ihgumilar/aimpathy/releases/tag/v0.1.0