from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pdf_processor import PDFProcessor
import os
import shutil
from typing import Optional, AsyncGenerator, Dict
import uuid
import json

app = FastAPI()
active_connections: Dict[str, WebSocket] = {}

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update with your frontend URL
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
    websocket = active_connections.get(socket_id)
    
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
    
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{session_id}.pdf")
        
        # Save the file
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        
        # Process the PDF with progress updates
        processor = PDFProcessor()
        success = await processor.process_pdf(file_path, send_progress)
        
        if success:
            pdf_processors[session_id] = processor
            await send_progress(100, "Processing complete!")
            return {"session_id": session_id, "message": "PDF processed successfully"}
        
        # Clean up on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to process PDF")
            
    except Exception as e:
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
    if not processor:
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
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    socket_id = str(id(websocket))
    active_connections[socket_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if socket_id in active_connections:
            del active_connections[socket_id]

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
                
                # Verify deletion
                remaining = os.listdir(UPLOAD_DIR)
                if remaining:
                    print(f"Warning: {len(remaining)} files still remaining: {remaining}")
                else:
                    print("All files successfully deleted")
                    
            except Exception as e:
                print(f"Error during cleanup: {e}")
                raise e
        
        print("=== Reset complete ===")
        return {"status": "success", "message": "Index and uploads cleared successfully"}
    except Exception as e:
        print(f"Error in reset_index: {e}")
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 