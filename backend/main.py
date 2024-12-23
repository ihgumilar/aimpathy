from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pdf_processor import PDFProcessor
import os
import shutil
from typing import Optional, AsyncGenerator, Dict
import uuid
import json
import subprocess

app = FastAPI()
active_connections: Dict[str, WebSocket] = {}

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store PDF processors for each session
pdf_processors = {}

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    socket_id: str = Form(None)
):
    """Handle PDF file upload and indexing."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    print(f"Received upload request with socket_id: {socket_id}")
    websocket = None
    
    # Find the WebSocket connection
    if socket_id:
        for ws_id, ws in active_connections.items():
            if str(ws_id) == socket_id:
                websocket = ws
                print(f"Found matching WebSocket connection: {ws_id}")
                break
    
    if not websocket:
        print("No matching WebSocket connection found")
    
    async def send_progress(progress: int, step: str):
        if websocket and websocket.client_state.CONNECTED:
            try:
                await websocket.send_json({
                    "progress": progress,
                    "step": step
                })
                print(f"Sent progress update: {progress}% - {step}")
            except Exception as e:
                print(f"Error sending progress update: {str(e)}")
        else:
            print("WebSocket not available for progress update")
    
    print(f"\n=== Starting upload process for file: {file.filename} ===")
    print(f"File content type: {file.content_type}")
    print(f"File size: {file.size if hasattr(file, 'size') else 'unknown'}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        print(f"Created session ID: {session_id}")
        
        # Save the file
        file_path = os.path.join(UPLOAD_DIR, f"{session_id}.pdf")
        try:
            contents = await file.read()
            print(f"Read file contents, size: {len(contents)} bytes")
            
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
            print(f"Successfully saved file to: {file_path}")
            print(f"Saved file exists: {os.path.exists(file_path)}")
            print(f"Saved file size: {os.path.getsize(file_path)} bytes")
        except Exception as e:
            print(f"Error saving file: {str(e)}")
            print(f"Stack trace:", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
        
        # Process the PDF with progress updates
        processor = PDFProcessor()
        success = await processor.process_pdf(file_path, send_progress)
        
        if success:
            pdf_processors[session_id] = processor
            await send_progress(100, "Processing complete!")
            print(f"Successfully indexed PDF: {file.filename}")
            print(f"Total active sessions: {len(pdf_processors)}")
            return {"session_id": session_id, "message": "PDF processed successfully"}
        
        print("Failed to process PDF - no success returned")
        # Clean up on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail="Failed to process and index PDF"
        )
            
    except Exception as e:
        print(f"Unexpected error during upload: {str(e)}")
        # Clean up on error
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_pdf(
    session_id: str = Form(...),
    query: str = Form(...)
):
    """Query the processed PDF content with streaming response."""
    processor = pdf_processors.get(session_id)
    if not processor or not processor.index:
        raise HTTPException(
            status_code=404, 
            detail="No file has been uploaded. Please upload a file first."
        )
    
    async def generate_response() -> AsyncGenerator[str, None]:
        try:
            async for chunk in processor.stream_query(query):
                if chunk:
                    if chunk.startswith('Error:'):
                        yield f"data: {json.dumps({'error': chunk})}\n\n"
                        break
                    else:
                        yield f"data: {json.dumps({'content': chunk})}\n\n"
        except Exception as e:
            print(f"Query error: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
            "X-Session-Id": session_id
        }
    )

@app.delete("/api/chat/session/{session_id}")
async def clear_session(session_id: str):
    """Clear the session and remove the PDF file."""
    try:
        if session_id in pdf_processors:
            # Get the processor before deleting
            processor = pdf_processors[session_id]
            
            # Clear the processor's index
            if processor and processor.index:
                processor.index = None
            
            # Remove from active processors
            del pdf_processors[session_id]
            
            # Remove the PDF file
            file_path = os.path.join(UPLOAD_DIR, f"{session_id}.pdf")
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"Successfully deleted file: {file_path}")
                except Exception as e:
                    print(f"Error deleting file: {e}")
                    # Try with force permissions
                    try:
                        os.chmod(file_path, 0o777)
                        os.remove(file_path)
                        print(f"Deleted file after chmod: {file_path}")
                    except Exception as e2:
                        print(f"Failed to delete file even with chmod: {e2}")
                
            return {"message": "Session cleared successfully"}
            
    except Exception as e:
        print(f"Error clearing session: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to clear session: {str(e)}"
        )
    
    raise HTTPException(status_code=404, detail="Session not found")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    socket_id = str(id(websocket))
    active_connections[socket_id] = websocket
    print(f"New WebSocket connection established: {socket_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received WebSocket message: {data}")
    except WebSocketDisconnect:
        if socket_id in active_connections:
            del active_connections[socket_id]
            print(f"WebSocket connection closed: {socket_id}")

@app.post("/api/reset-index")
async def reset_index():
    """Reset the vector store index and clean up all uploaded files."""
    try:
        print("\n=== Starting index reset and file cleanup ===")
        # Clear all active sessions
        pdf_processors.clear()
        print("Cleared all active PDF processors")
        
        print(f"Cleaning directory: {UPLOAD_DIR}")
        
        if os.path.exists(UPLOAD_DIR):
            try:
                # List all files before deletion
                files = os.listdir(UPLOAD_DIR)
                print(f"Found {len(files)} files to delete: {files}")
                
                # Delete each file
                for filename in files:
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    if os.path.isfile(file_path):
                        try:
                            print(f"Attempting to delete: {file_path}")
                            os.remove(file_path)
                            print(f"Successfully deleted: {file_path}")
                        except PermissionError:
                            print(f"Permission error, trying with chmod: {file_path}")
                            os.chmod(file_path, 0o777)
                            os.remove(file_path)
                            print(f"Deleted after chmod: {file_path}")
                        except Exception as e:
                            print(f"Failed to delete {file_path}: {e}")
                            # Try system command as last resort
                            os.system(f"rm -f '{file_path}'")
                
                # Verify deletion
                remaining = os.listdir(UPLOAD_DIR)
                if remaining:
                    print(f"Warning: {len(remaining)} files still remaining: {remaining}")
                else:
                    print("All files successfully deleted")
                    
            except Exception as e:
                print(f"Error during cleanup: {e}")
                raise e
        else:
            print(f"Upload directory does not exist: {UPLOAD_DIR}")
        
        print("=== Reset complete ===")
        return {"status": "success", "message": "Index and uploads cleared successfully"}
    except Exception as e:
        print(f"Error in reset_index: {e}")
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": str(e)}
        )

def initialize_index():
    # Create empty index directory if it doesn't exist
    if not os.path.exists("index"):
        os.makedirs("index")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 