from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.schema import Document
from llama_index.readers.file import PDFReader
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
from typing import List, AsyncGenerator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PDFProcessor:
    def __init__(self):
        self.index = None
        
        print("Initializing PDFProcessor with settings...")
        try:
            # Initialize Groq LLM with streaming
            llm = Groq(
                api_key=os.getenv("GROQ_API_KEY"),
                model="llama3-8b-8192",
                streaming=True
            )
            print("Groq LLM initialized successfully")
            
            # Initialize local embedding model
            embed_model = HuggingFaceEmbedding(
                model_name="BAAI/bge-small-en-v1.5"
            )
            print("Embedding model initialized successfully")
            
            # Configure LlamaIndex settings
            Settings.chunk_size = 1000
            Settings.chunk_overlap = 200
            Settings.llm = llm
            Settings.embed_model = embed_model
            
            # Configure node parser
            self.node_parser = SentenceSplitter(
                chunk_size=1024,
                chunk_overlap=200,
                paragraph_separator="\n\n",
            )
            print("Node parser configured successfully")
        except Exception as e:
            print(f"Error during initialization: {str(e)}")
            raise e

    async def process_pdf(self, file_path: str, send_progress) -> bool:
        """Process a PDF file and create an index."""
        try:
            print("Starting PDF processing...")
            await send_progress(5, "Starting PDF processing...")
            
            print("Initializing PDF reader...")
            reader = PDFReader()
            await send_progress(10, "Initializing PDF reader...")
            
            try:
                print("Loading PDF...")
                documents = reader.load_data(file_path)
                print(f"Loaded {len(documents)} documents")
                await send_progress(30, "PDF loaded successfully")
                
                if not documents:
                    print("No content extracted from PDF")
                    await send_progress(0, "Error: No content extracted from PDF")
                    return False
                    
                print("Processing PDF content...")
                await send_progress(50, "Processing PDF content...")
                
                print("Creating document nodes...")
                nodes = self.node_parser.get_nodes_from_documents(documents)
                print(f"Created {len(nodes)} nodes")
                await send_progress(70, "Creating document nodes...")
                
                for node in nodes:
                    node.metadata.update({
                        "file_name": os.path.basename(file_path),
                        "doc_id": str(documents[0].doc_id)
                    })
                
                print("Creating vector index...")
                await send_progress(80, "Creating vector index...")
                self.index = VectorStoreIndex(nodes, show_progress=True)
                
                print("Processing complete!")
                await send_progress(100, "Processing complete!")
                return True
                
            except Exception as e:
                print(f"Error during processing: {str(e)}")
                await send_progress(0, f"Error: {str(e)}")
                return False
                
        except Exception as e:
            print(f"Error processing PDF: {str(e)}")
            await send_progress(0, f"Error: {str(e)}")
            return False

    async def query_pdf(self, query_text: str) -> str:
        """Query the indexed PDF content."""
        if not self.index:
            raise ValueError("No PDF has been processed yet")
            
        # Create query engine
        query_engine = self.index.as_query_engine(
            streaming=False,
            similarity_top_k=3,
            response_mode="tree_summarize",
            verbose=True
        )
        
        # Query the index
        response = await query_engine.aquery(query_text)
        return str(response)

    async def stream_query(self, query_text: str) -> AsyncGenerator[str, None]:
        """Stream the query response."""
        if not self.index:
            raise ValueError("No PDF has been processed yet")
            
        try:
            # Create streaming query engine
            query_engine = self.index.as_query_engine(
                streaming=True,
                similarity_top_k=3,
                response_mode="tree_summarize",
                verbose=True
            )
            
            # Stream the response
            streaming_response = await query_engine.aquery(query_text)
            
            async for text_chunk in streaming_response.async_response_gen():
                if text_chunk is not None:
                    yield str(text_chunk)
        except Exception as e:
            print(f"Streaming error: {str(e)}")
            yield f"Error: {str(e)}"

# Usage example:
# processor = PDFProcessor()
# processor.process_pdf("path/to/pdf")
# response = processor.query_pdf("What is this document about?") 