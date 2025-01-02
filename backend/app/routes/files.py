from fastapi import APIRouter, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import shutil
from typing import Optional, Dict, AsyncGenerator
import uuid
import json
from pdf_processor import PDFProcessor

router = APIRouter()

# Store active WebSocket connections and PDF processors
active_connections: Dict[str, WebSocket] = {}
pdf_processors: Dict[str, PDFProcessor] = {}

# Directory to store uploaded files
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    socket_id: str = None
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

@router.websocket("/ws")
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

@router.post("/query")
async def query_pdf(
    session_id: str,
    query: str
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

@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear the session and remove the PDF file."""
    try:
        if session_id in pdf_processors:
            processor = pdf_processors[session_id]
            if processor:
                processor.cleanup()
            del pdf_processors[session_id]
            
            file_path = os.path.join(UPLOAD_DIR, f"{session_id}.pdf")
            if os.path.exists(file_path):
                os.remove(file_path)
                
            return {"message": "Session cleared successfully"}
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to clear session: {str(e)}"
        )
    
    raise HTTPException(status_code=404, detail="Session not found") 