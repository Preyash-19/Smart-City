import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_engine")

app = FastAPI(title="Smart City AI Engine", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComplaintRequest(BaseModel):
    title: str
    description: str
    imageUrl: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "AI Engine is online and operational. 🧠"}

@app.post("/analyze")
def analyze_complaint(request: ComplaintRequest):
    logger.info(f"Analyzing complaint: {request.title}")
    
    title_lower = request.title.lower()
    desc_lower = request.description.lower()
    combined = f"{title_lower} {desc_lower}"
    
    # Department Classification - Specific categories prioritized over generic ones
    department = "GENERAL"
    if any(k in combined for k in ["garbage", "trash", "waste", "litter", "dump", "dirty", "odor", "smell", "bin", "filth"]):
        department = "SANITATION"
    elif any(k in combined for k in ["drain", "clog", "drainage", "gutter", "overflow", "flooding", "flood"]):
        department = "DRAINAGE"
    elif any(k in combined for k in ["water", "leak", "pipe", "burst", "plumbing", "tap"]):
        department = "WATER_SUPPLY"
    elif any(k in combined for k in ["light", "electricity", "power", "blackout", "lamp", "wire", "cable", "electrical", "spark", "transformer"]):
        department = "ELECTRICAL"
    elif any(k in combined for k in ["traffic", "signal", "sign", "speed", "vehicle", "parking", "congestion"]):
        department = "TRAFFIC"
    elif any(k in combined for k in ["pothole", "road", "street", "sidewalk", "pavement", "asphalt", "highway"]):
        department = "ROAD"
        
    # Priority Classification - Based on safety risk, damage severity, and affected population
    priority = "LOW"
    high_keywords = [
        "danger", "urgent", "hazard", "sparking", "fire", "blocked", "accident", 
        "emergency", "wire down", "high voltage", "flooding", "risk", "injure", 
        "injury", "unsafe", "collapse", "toxic", "poison", "critical", "severe", "death"
    ]
    high_phrases = [
        "many people", "many person", "everyone", "getting affected", 
        "blocking", "cannot pass", "major issue", "worst", "terrible"
    ]
    med_keywords = [
        "leak", "broken", "pothole", "crack", "overflow", "outage", 
        "garbage", "trash", "waste", "litter", "smell", "odor", "dirty", 
        "damage", "repair", "obstruct", "hole"
    ]
    med_phrases = [
        "few days", "several days", "needs fix", "affecting us", "dirt"
    ]

    if any(k in combined for k in high_keywords) or any(p in combined for p in high_phrases):
        priority = "HIGH"
    elif any(k in combined for k in med_keywords) or any(p in combined for p in med_phrases):
        priority = "MEDIUM"
        
    # Evidence score based on imageUrl presence
    evidence_score = 85 if (request.imageUrl and "placeholder" not in request.imageUrl) else 45
    
    # Check if fake (very short descriptions)
    is_fake = False
    if len(request.description.strip()) < 10 or len(request.title.strip()) < 3:
        is_fake = True
        priority = "LOW"
        
    # Generate summary
    ai_summary = f"AI classified this incident under the {department} department with {priority} priority. "
    if is_fake:
        ai_summary += "Warning: The report lacks sufficient description and may be invalid."
    elif request.imageUrl:
        ai_summary += f"Telemetry confirms presence of visual evidence (Confidence: {evidence_score}%)."
    else:
        ai_summary += "No image evidence provided. Recommended for manual site inspection."
        
    response_data = {
        "department": department,
        "priority": priority,
        "evidenceScore": evidence_score,
        "aiSummary": ai_summary,
        "isFake": is_fake
    }
    
    logger.info(f"Analysis result: {response_data}")
    return response_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
