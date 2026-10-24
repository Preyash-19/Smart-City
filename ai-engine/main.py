import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
from vision_pipeline import analyze_civic_image, validate_image_quality

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_engine")

app = FastAPI(title="Smart City AI Engine & Civic Vision Intelligence", version="3.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComplaintRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    imageUrl: Optional[str] = None
    image_url: Optional[str] = None
    department: Optional[str] = "ROAD"
    language: Optional[str] = "en"

@app.get("/")
def read_root():
    return {
        "status": "AI Engine & Civic Vision Intelligence is online and operational. 🧠",
        "version": "3.0.0",
        "model_architecture": "OpenAI CLIP (ViT-B/32) + OpenCV Spatial Defect Engine",
        "pipeline_stages": [
            "Stage A: Physical Quality & Usability Validation",
            "Stage B: Multi-Modal Civic Relevance Classification",
            "Stage C: Spatial Issue & Defect Identification",
            "Stage D: Department Compatibility & Cross-Check",
            "Stage E: Calibrated Severity Scoring (Extent & Public Hazard Based)"
        ]
    }

@app.post("/analyze")
def analyze_complaint(request: ComplaintRequest):
    dept = request.department or "ROAD"
    img_url = request.imageUrl or request.image_url
    logger.info(f"Incoming analysis request: department={dept}, image={img_url[:60] if img_url else 'None'}")
    
    result = analyze_civic_image(img_url, dept)
    logger.info(f"Analysis result: dept={result.get('predicted_department')}, relevance={result.get('civic_relevance')}, severity={result.get('severity')}, status={result.get('verification_status')}")
    return result

@app.get("/evaluate")
def evaluate_pipeline():
    """
    Evaluates the visual analysis pipeline on real labeled benchmark images.
    Calculates empirical precision, recall, and false-positive rate from actual inference.
    """
    test_dir = os.path.join(os.path.dirname(__file__), "test_images")
    if not os.path.exists(test_dir):
        test_dir = "test_images"

    # Labeled ground truth validation set
    validation_set = [
        {"file": "pothole.jpg", "expected_relevance": "RELEVANT", "expected_dept": "ROAD", "min_sev": "MEDIUM"},
        {"file": "garbage.jpg", "expected_relevance": "RELEVANT", "expected_dept": "SANITATION", "min_sev": "LOW"},
        {"file": "water_leak.jpg", "expected_relevance": "RELEVANT", "expected_dept": "WATER_SUPPLY", "min_sev": "LOW"},
        {"file": "streetlight.jpg", "expected_relevance": "RELEVANT", "expected_dept": "ELECTRICAL", "min_sev": "LOW"},
        {"file": "selfie.jpg", "expected_relevance": "IRRELEVANT", "expected_dept": "UNSUPPORTED", "min_sev": "REJECTED_AS_IRRELEVANT"},
        {"file": "food.jpg", "expected_relevance": "IRRELEVANT", "expected_dept": "UNSUPPORTED", "min_sev": "REJECTED_AS_IRRELEVANT"},
        {"file": "cat_animal.jpg", "expected_relevance": "IRRELEVANT", "expected_dept": "UNSUPPORTED", "min_sev": "REJECTED_AS_IRRELEVANT"},
        {"file": "landscape.jpg", "expected_relevance": "IRRELEVANT", "expected_dept": "UNSUPPORTED", "min_sev": "REJECTED_AS_IRRELEVANT"},
        {"file": "dark.jpg", "expected_relevance": "IMAGE_UNUSABLE", "expected_dept": "UNSUPPORTED", "min_sev": "REJECTED_AS_IRRELEVANT"},
        {"file": "blurry.jpg", "expected_relevance": "UNCERTAIN", "expected_dept": "ROAD", "min_sev": "LOW"}
    ]

    results = []
    tp = 0  # Civic detected as Civic
    fp = 0  # Non-civic detected as Civic
    tn = 0  # Non-civic detected as Non-civic/Unusable
    fn = 0  # Civic detected as Non-civic

    for item in validation_set:
        img_path = os.path.join(test_dir, item["file"])
        if not os.path.exists(img_path):
            continue

        res = analyze_civic_image(img_path, item["expected_dept"])
        actual_rel = res.get("civic_relevance")
        actual_sev = res.get("severity")
        actual_dept = res.get("predicted_department")
        actual_status = res.get("verification_status")

        is_ground_civic = (item["expected_relevance"] == "RELEVANT")
        is_pred_civic = (actual_rel == "RELEVANT")

        if is_ground_civic and is_pred_civic:
            tp += 1
            passed = True
        elif not is_ground_civic and not is_pred_civic:
            tn += 1
            passed = True
        elif not is_ground_civic and is_pred_civic:
            fp += 1
            passed = False
        else:
            fn += 1
            passed = False

        results.append({
            "test_file": item["file"],
            "expected_relevance": item["expected_relevance"],
            "actual_relevance": actual_rel,
            "actual_severity": actual_sev,
            "actual_department": actual_dept,
            "verification_status": actual_status,
            "passed": passed
        })

    # Department mismatch test (Pothole submitted under SANITATION)
    pothole_path = os.path.join(test_dir, "pothole.jpg")
    mismatch_passed = False
    mismatch_suggested = "ROAD"
    if os.path.exists(pothole_path):
        mismatch_res = analyze_civic_image(pothole_path, "SANITATION")
        if mismatch_res.get("department_match") == "MISMATCH" and mismatch_res.get("predicted_department") == "ROAD":
            mismatch_passed = True
            mismatch_suggested = mismatch_res.get("predicted_department")
    
    results.append({
        "test": "department_mismatch",
        "passed": mismatch_passed,
        "status": "MISMATCH" if mismatch_passed else "MATCH",
        "suggested": mismatch_suggested
    })

    # Dark image unusable test
    dark_path = os.path.join(test_dir, "dark.jpg")
    dark_passed = False
    dark_code = "VALID"
    if os.path.exists(dark_path):
        dark_res = analyze_civic_image(dark_path, "ROAD")
        if dark_res.get("civic_relevance") == "IMAGE_UNUSABLE":
            dark_passed = True
            dark_code = "IMAGE_UNUSABLE_TOO_DARK"

    results.append({
        "test": "dark_image_unusable",
        "passed": dark_passed,
        "code": dark_code
    })

    precision = round(tp / max(tp + fp, 1), 3)
    recall = round(tp / max(tp + fn, 1), 3)
    fpr = round(fp / max(fp + tn, 1), 3)
    all_passed = all(r.get("passed", False) for r in results)

    return {
        "evaluation_summary": {
            "total_benchmark_tests": len(results),
            "passed": all_passed,
            "true_positives": tp,
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "relevance_precision": precision,
            "relevance_recall": recall,
            "false_positive_rate": fpr,
            "calibrated_severity_levels": ["LOW", "MEDIUM", "HIGH", "CRITICAL", "REJECTED_AS_IRRELEVANT"],
            "model_architecture": "OpenAI CLIP (ViT-B/32) + Dual-Space Skin Geometry + Multi-Stage Quality & Relevance Gate"
        },
        "test_results": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
