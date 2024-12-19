from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pdf_processor import PDFProcessor
import os
import shutil
from typing import Optional, AsyncGenerator
import uuid
import json

app = FastAPI()

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
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Handle PDF file upload and indexing."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
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
        
        # Process the PDF
        print("Initializing PDFProcessor...")
        processor = PDFProcessor()
        print(f"Processing PDF: {file.filename}")
        success = await processor.process_pdf(file_path)
        
        if success:
            pdf_processors[session_id] = processor
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
    if not processor:
        raise HTTPException(status_code=404, detail="Session not found")
    
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

@app.delete("/api/session/{session_id}")
async def clear_session(session_id: str):
    """Clear the session and remove the PDF file."""
    if session_id in pdf_processors:
        del pdf_processors[session_id]
        
        # Remove the PDF file
        file_path = os.path.join(UPLOAD_DIR, f"{session_id}.pdf")
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {"message": "Session cleared successfully"}
    raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 