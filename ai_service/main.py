from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from services.extractor import extractor_service
from utils.pdf_parser import parse_pdf
from utils.excel_parser import parse_excel
import io

app = FastAPI(title="PlaceReady AI Service", description="FastAPI service for Tag Extraction and Gap Analysis")

# Enable CORS for internal communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your Node.js backend IP
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online", 
        "service": "PlaceReady AI",
        "version": "1.0.0"
    }

@app.post("/extract-tags")
async def extract_tags(file: UploadFile = File(...)):
    filename = file.filename.lower()
    
    # Identify file type
    if filename.endswith('.pdf'):
        parser = parse_pdf
    elif filename.endswith(('.xlsx', '.xls', '.csv')):
        parser = parse_excel
    else:
        raise HTTPException(status_code=400, detail="Only PDF, Excel, and CSV files are supported")
    
    try:
        # Read file into memory
        contents = await file.read()
        
        # Parse content based on file type
        text = parser(io.BytesIO(contents))
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract data from the provided file")

        # Call Gemini via the extractor service
        extraction_result = await extractor_service.extract_tags_from_text(text)
        
        return {
            "success": True,
            "data": extraction_result
        }
    
    except Exception as e:
        print(f"Error in extraction process: {e}")
        raise HTTPException(status_code=500, detail=f"AI Extraction Failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
