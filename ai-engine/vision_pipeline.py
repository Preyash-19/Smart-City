import os
import io
import math
import base64
import logging
import requests
import numpy as np
from PIL import Image
import cv2
import torch
import torchvision.transforms as T
import torchvision.models as models
from transformers import CLIPProcessor, CLIPModel

logger = logging.getLogger("vision_pipeline")
logger.setLevel(logging.INFO)

# ==============================================================================
# MODEL REGISTRY (CLIP ViT-B/32 + MobileNetV3-Small)
# ==============================================================================
_clip_model = None
_clip_processor = None
_mobilenet_model = None
_mobilenet_transforms = None
_mobilenet_categories = None

def get_clip_engine():
    global _clip_model, _clip_processor
    if _clip_model is None or _clip_processor is None:
        try:
            logger.info("Initializing OpenAI CLIP (ViT-B/32) from local cache...")
            _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            _clip_model.eval()
            _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            logger.info("OpenAI CLIP loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load CLIP: {e}")
            _clip_model = None
            _clip_processor = None
    return _clip_model, _clip_processor

def get_mobilenet():
    global _mobilenet_model, _mobilenet_transforms, _mobilenet_categories
    if _mobilenet_model is None:
        try:
            logger.info("Initializing MobileNetV3 Small from local weights...")
            weights = models.MobileNet_V3_Small_Weights.DEFAULT
            _mobilenet_model = models.mobilenet_v3_small(weights=weights)
            _mobilenet_model.eval()
            _mobilenet_transforms = weights.transforms()
            _mobilenet_categories = weights.meta["categories"]
            logger.info("MobileNetV3 model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load MobileNetV3: {e}")
            _mobilenet_model = None
    return _mobilenet_model, _mobilenet_transforms, _mobilenet_categories

# Pre-warmed prompt definitions for zero-shot inference
CIVIC_BENCHMARK_PROMPTS = {
    # Positive Civic Categories (Strictly the 5 Supported Departments)
    ("ROAD", "POTHOLE"): "a photo of a pothole, road surface depression, or asphalt crater on a street",
    ("ROAD", "ROAD_CRACK"): "a photo of cracked asphalt pavement or road surface wear",
    ("SANITATION", "OVERFLOWING_GARBAGE"): "a photo of overflowing garbage, trash pile, or dumped municipal waste on the ground",
    ("SANITATION", "SCATTERED_LITTER"): "a photo of scattered plastic litter, bottles, and street debris",
    ("WATER_SUPPLY", "WATER_PIPE_BURST"): "a photo of a burst water pipe, gushing water leak, or pressurized water main spraying water",
    ("WATER_SUPPLY", "WATER_LEAKAGE"): "a photo of leaking water, pooled clean water from a pipe or public tap",
    ("ELECTRICAL", "DAMAGED_STREETLIGHT"): "a photo of a damaged streetlight, broken lamp post, or street lighting fixture",
    ("ELECTRICAL", "DANGLING_POWER_CABLE"): "a photo of dangerous dangling power cables, downed electric wire, or open electrical junction box",
    ("DRAINAGE", "CLOGGED_DRAIN"): "a photo of a clogged storm drain, blocked street sewer grate, or open gutter",
    ("DRAINAGE", "SEWAGE_OVERFLOW"): "a photo of dirty sewage water overflowing onto a road or pavement",

    # Negative / Unsupported Categories
    ("UNSUPPORTED", "UNSUPPORTED_TRAFFIC"): "a photo of a broken traffic signal light, damaged traffic sign, or road divider",
    ("UNSUPPORTED", "SELFIE_PORTRAIT"): "a photo of a personal selfie, portrait, or human face",
    ("UNSUPPORTED", "PERSONAL_APPAREL"): "a photo of clothing, shoes, personal apparel, or fashion accessories",
    ("UNSUPPORTED", "FOOD_ITEM"): "a photo of food, cooked dish, meal, snack, pizza, or groceries",
    ("UNSUPPORTED", "ANIMAL_PET"): "a photo of a dog, cat, bird, domestic pet, or wild animal",
    ("UNSUPPORTED", "INDOOR_DOMESTIC"): "a photo of an indoor domestic room, bedroom, living room furniture, or kitchen",
    ("UNSUPPORTED", "DIGITAL_SCREEN"): "a photo of a computer monitor, digital document, graphic user interface, or phone screenshot",
    ("UNSUPPORTED", "LANDSCAPE_NATURE"): "a photo of a scenic natural landscape, mountain, or forest with no road damage",
    ("UNSUPPORTED", "PRIVATE_VEHICLE"): "a photo of a private automobile, car, or bicycle parked normally with no damage"
}

PROMPT_KEYS = list(CIVIC_BENCHMARK_PROMPTS.keys())
PROMPT_TEXTS = list(CIVIC_BENCHMARK_PROMPTS.values())

NON_CIVIC_KEYS = {
    ("UNSUPPORTED", "UNSUPPORTED_TRAFFIC"),
    ("UNSUPPORTED", "SELFIE_PORTRAIT"),
    ("UNSUPPORTED", "PERSONAL_APPAREL"),
    ("UNSUPPORTED", "FOOD_ITEM"),
    ("UNSUPPORTED", "ANIMAL_PET"),
    ("UNSUPPORTED", "INDOOR_DOMESTIC"),
    ("UNSUPPORTED", "DIGITAL_SCREEN"),
    ("UNSUPPORTED", "LANDSCAPE_NATURE"),
    ("UNSUPPORTED", "PRIVATE_VEHICLE")
}

DEPT_METRICS = {
    "ROAD": {
        "name_en": "Roads & Potholes",
        "name_hi": "सड़कें और गड्ढे",
        "name_mr": "रस्ते आणि खड्डे",
    },
    "SANITATION": {
        "name_en": "Sanitation & Garbage",
        "name_hi": "स्वच्छता और कचरा",
        "name_mr": "स्वच्छता आणि कचरा",
    },
    "WATER_SUPPLY": {
        "name_en": "Water Supply",
        "name_hi": "जल आपूर्ति",
        "name_mr": "पाणी पुरवठा",
    },
    "ELECTRICAL": {
        "name_en": "Electricity & Streetlights",
        "name_hi": "बिजली और स्ट्रीटलाइट",
        "name_mr": "वीज आणि पथदिवे",
    },
    "DRAINAGE": {
        "name_en": "Drainage & Sewage",
        "name_hi": "जल निकासी और सीवरेज",
        "name_mr": "ड्रेनेज आणि सांडपाणी",
    }
}

# ==============================================================================
# IMAGE INGESTION: URL, LOCAL PATH, BASE64 DATA URI
# ==============================================================================
def download_or_load_image(image_source):
    """
    Decodes an image from:
    1. Base64 data URI (data:image/...;base64,...)
    2. Local filesystem path
    3. HTTP / HTTPS URL
    """
    if not image_source or not isinstance(image_source, str) or image_source.strip() == "":
        return None, "NO_IMAGE_PROVIDED"

    src = image_source.strip()

    # Case 1: Base64 data URI or raw Base64 string
    if src.startswith("data:image/") or ";base64," in src:
        try:
            base64_data = src.split(";base64,")[-1]
            image_bytes = base64.b64decode(base64_data)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            return img, None
        except Exception as e:
            return None, f"BASE64_DECODE_ERROR: {str(e)}"

    # Case 2: Local filesystem path
    if os.path.exists(src):
        try:
            img = Image.open(src).convert("RGB")
            return img, None
        except Exception as e:
            return None, f"LOCAL_FILE_ERROR: {str(e)}"

    # Check relative path from root
    for candidate in [
        os.path.join(os.path.dirname(__file__), src),
        os.path.join(os.path.dirname(__file__), "..", src),
        os.path.join(os.path.dirname(__file__), "..", "backend", src)
    ]:
        if os.path.exists(candidate):
            try:
                img = Image.open(candidate).convert("RGB")
                return img, None
            except Exception as e:
                return None, f"LOCAL_FILE_ERROR: {str(e)}"

    # Case 3: HTTP/HTTPS remote URL
    if src.startswith("http://") or src.startswith("https://"):
        # Catch obvious fake placeholder URLs
        if "example.com" in src or "placeholder" in src.lower():
            return None, "PLACEHOLDER_URL_REJECTED"

        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartCityCivicAI/3.0"}
            resp = requests.get(src, headers=headers, timeout=12, stream=True)
            if resp.status_code != 200:
                return None, f"HTTP_FETCH_FAILED_{resp.status_code}"
            
            content = resp.content
            if len(content) > 20 * 1024 * 1024:
                return None, "FILE_TOO_LARGE"

            img = Image.open(io.BytesIO(content)).convert("RGB")
            return img, None
        except Exception as e:
            return None, f"URL_FETCH_ERROR: {str(e)}"

    return None, "UNSUPPORTED_IMAGE_SOURCE"

# ==============================================================================
# STAGE A: IMAGE QUALITY & USABILITY ASSURANCE
# ==============================================================================
def validate_image_quality(pil_image):
    """
    Validates physical pixel properties: resolution, underexposure, overexposure, blur, contrast.
    Returns: (is_usable: bool, status_code: str, metrics: dict)
    """
    if pil_image is None:
        return False, "IMAGE_MISSING", {}

    width, height = pil_image.size
    if width < 40 or height < 40:
        return False, "RESOLUTION_TOO_LOW", {"width": width, "height": height, "reason": "Image resolution is too low"}

    cv_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

    # 1. Luminance / Brightness check
    mean_brightness = float(np.mean(gray))
    if mean_brightness < 18.0:
        return False, "IMAGE_UNUSABLE_TOO_DARK", {
            "brightness": round(mean_brightness, 2),
            "reason": "Image is critically underexposed / pitch black"
        }
    if mean_brightness > 248.0:
        return False, "IMAGE_UNUSABLE_OVEREXPOSED", {
            "brightness": round(mean_brightness, 2),
            "reason": "Image is severely overexposed / washed out"
        }

    # 2. Blur / Sharpness check using Laplacian variance
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = laplacian_var < 15.0 and (width >= 150 and height >= 150)

    # 3. Contrast check
    std_dev = float(np.std(gray))
    if std_dev < 6.0:
        return False, "IMAGE_UNUSABLE_BLANK", {
            "contrast": round(std_dev, 2),
            "reason": "Image lacks visual contrast or discernible features"
        }

    # 4. Defect area measurement (for severity calibration)
    # Otsu thresholding to find prominent dark/depression contours (potholes/cavities)
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    cnts, _ = cv2.findContours(otsu, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    total_area = float(width * height)
    max_contour_area = 0.0
    for c in cnts:
        area = cv2.contourArea(c)
        if 0.01 < (area / total_area) < 0.70:
            if area > max_contour_area:
                max_contour_area = area
    defect_area_ratio = max_contour_area / total_area

    # Edge density (surface texture / cracks)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = float(np.sum(edges > 0)) / total_area

    metrics = {
        "width": width,
        "height": height,
        "brightness": round(mean_brightness, 2),
        "sharpness": round(laplacian_var, 2),
        "contrast": round(std_dev, 2),
        "is_blurry": is_blurry,
        "defect_area_ratio": round(defect_area_ratio, 4),
        "edge_density": round(edge_density, 4)
    }

    if is_blurry:
        return True, "UNCERTAIN_BLURRY", metrics

    return True, "VALID", metrics

# ==============================================================================
# STAGE B & C: MULTI-MODAL RELEVANCE & ISSUE INFERENCE (CLIP + OpenCV)
# ==============================================================================
def detect_and_classify_visuals(pil_image, quality_metrics, selected_department):
    """
    Processes actual image pixels using OpenAI CLIP vision transformer + OpenCV spatial features.
    Determines:
    1. Civic relevance (RELEVANT, IRRELEVANT, UNCERTAIN)
    2. Predicted department (ROAD, SANITATION, WATER_SUPPLY, ELECTRICAL, DRAINAGE, TRAFFIC, OTHER)
    3. Issue category (POTHOLE, OVERFLOWING_GARBAGE, etc.)
    4. Classification confidence (0.0 to 1.0)
    5. Visual evidence reasons
    """
    # 1. OpenCV Human Skin / Portrait Gate
    cv_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    h, w = cv_img.shape[:2]
    total_pixels = float(h * w)

    ycrcb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2YCrCb)
    lower_skin = np.array([0, 133, 77], dtype=np.uint8)
    upper_skin = np.array([255, 173, 127], dtype=np.uint8)
    skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
    skin_ratio = float(np.sum(skin_mask > 0)) / total_pixels

    upper_h = max(int(h * 0.65), 1)
    upper_skin_ratio = float(np.sum(skin_mask[:upper_h, :] > 0)) / float(upper_h * w)

    contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    max_skin_contour_area = max([cv2.contourArea(c) for c in contours]) if contours else 0.0
    max_skin_contour_ratio = max_skin_contour_area / total_pixels

    is_obvious_selfie = (upper_skin_ratio > 0.22 or skin_ratio > 0.18 or max_skin_contour_ratio > 0.09)

    # 2. Deep Vision Inference via CLIP
    clip_model, clip_processor = get_clip_engine()
    
    if clip_model is None or clip_processor is None:
        logger.warning("CLIP model unavailable; falling back to cautious review state.")
        return {
            "civic_relevance": "UNCERTAIN",
            "issue_category": "UNVERIFIED_REPORT",
            "predicted_department": selected_department,
            "classification_confidence": 0.35,
            "evidence_reasons": ["Automated vision model is temporarily offline; manual review required."]
        }

    try:
        inputs = clip_processor(text=PROMPT_TEXTS, images=pil_image, return_tensors="pt", padding=True)
        with torch.no_grad():
            outputs = clip_model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)[0].detach().cpu().numpy()

        # Aggregate total civic vs non-civic probabilities
        non_civic_prob = 0.0
        civic_prob = 0.0
        civic_candidates = []
        non_civic_candidates = []

        for idx, (dept, cat) in enumerate(PROMPT_KEYS):
            p = float(probs[idx])
            if (dept, cat) in NON_CIVIC_KEYS:
                non_civic_prob += p
                non_civic_candidates.append((dept, cat, p))
            else:
                civic_prob += p
                civic_candidates.append((dept, cat, p))

        # Sort candidate lists
        civic_candidates.sort(key=lambda x: x[2], reverse=True)
        non_civic_candidates.sort(key=lambda x: x[2], reverse=True)

        top_civic = civic_candidates[0]
        top_non_civic = non_civic_candidates[0]

        logger.info(f"CLIP Inference: CivicSum={civic_prob:.3f} (Top: {top_civic[0]}:{top_civic[1]}={top_civic[2]:.3f}) | NonCivicSum={non_civic_prob:.3f} (Top: {top_non_civic[1]}={top_non_civic[2]:.3f})")

        # Decision Logic:
        # A. Obvious Selfie / Face detected via OpenCV or CLIP
        is_confirmed_selfie = (
            (top_non_civic[1] == "SELFIE_PORTRAIT" and top_non_civic[2] > 0.40) or
            (top_non_civic[1] == "SELFIE_PORTRAIT" and is_obvious_selfie) or
            (is_obvious_selfie and civic_prob < 0.25)
        )

        if is_confirmed_selfie:
            return {
                "civic_relevance": "IRRELEVANT",
                "issue_category": "SELFIE_PORTRAIT",
                "predicted_department": "UNSUPPORTED",
                "classification_confidence": round(max(top_non_civic[2], 0.95), 2),
                "evidence_reasons": [
                    "Photograph contains a personal selfie or human facial portrait.",
                    "No public municipal infrastructure defect is present in the image."
                ]
            }

        # B. Unsupported Traffic / Transit Hardware (Deprecated Department)
        if top_non_civic[1] == "UNSUPPORTED_TRAFFIC" and (top_non_civic[2] > 0.35 or non_civic_prob > civic_prob):
            return {
                "civic_relevance": "UNCERTAIN",
                "issue_category": "UNSUPPORTED_CATEGORY",
                "predicted_department": "UNSUPPORTED",
                "classification_confidence": round(top_non_civic[2], 2),
                "evidence_reasons": [
                    "Visual model detected traffic signal or transit hardware, which is no longer a supported department in Smart City AI.",
                    "Manual administrative review required rather than assigning to an unrelated department."
                ]
            }

        # C. Non-Civic Object (Food, Pet, Apparel, Furniture, Nature landscape without defects)
        if (non_civic_prob > civic_prob and top_non_civic[2] > 0.35) or (top_non_civic[2] > 0.55 and top_civic[2] < 0.30):
            non_civic_label = top_non_civic[1].replace("_", " ").title()
            return {
                "civic_relevance": "IRRELEVANT",
                "issue_category": top_non_civic[1],
                "predicted_department": "UNSUPPORTED",
                "classification_confidence": round(max(top_non_civic[2], non_civic_prob, 0.85), 2),
                "evidence_reasons": [
                    f"Visual model identified non-civic subject ({non_civic_label}) with {int(max(top_non_civic[2], non_civic_prob)*100)}% confidence.",
                    "Subject is unrelated to municipal public works or civic infrastructure defects."
                ]
            }

        # D. Blurry / Degraded / Low Contrast
        if quality_metrics.get("is_blurry", False):
            return {
                "civic_relevance": "UNCERTAIN",
                "issue_category": "AMBIGUOUS_BLURRY_IMAGE",
                "predicted_department": selected_department,
                "classification_confidence": 0.40,
                "evidence_reasons": [
                    "Photograph suffers from severe optical or motion blur (Laplacian variance < 15).",
                    "Visual details cannot be reliably validated; field inspection required."
                ]
            }

        # E. Confirmed Civic Defect in one of the 5 Supported Departments
        pred_dept = top_civic[0]
        pred_issue = top_civic[1]
        
        # Calibrate classification confidence based on civic probability dominance
        confidence = float(top_civic[2] / max(civic_prob, 0.001))
        calibrated_conf = min(max(round(confidence * 0.85 + civic_prob * 0.15, 2), 0.55), 0.98)

        dept_info = DEPT_METRICS.get(pred_dept, {"name_en": pred_dept, "name_hi": pred_dept, "name_mr": pred_dept})
        readable_issue = pred_issue.replace("_", " ").title()

        return {
            "civic_relevance": "RELEVANT",
            "issue_category": pred_issue,
            "predicted_department": pred_dept,
            "classification_confidence": calibrated_conf,
            "evidence_reasons": [
                f"Visual telemetry confirms {readable_issue} within {dept_info['name_en']} domain.",
                f"Defect signature verified with {int(calibrated_conf * 100)}% classification confidence."
            ]
        }

    except Exception as e:
        logger.error(f"Error during vision classification: {e}")
        return {
            "civic_relevance": "UNCERTAIN",
            "issue_category": "ANALYSIS_ERROR",
            "predicted_department": selected_department,
            "classification_confidence": 0.30,
            "evidence_reasons": [f"Vision inference pass encountered an exception: {str(e)}"]
        }

# ==============================================================================
# STAGE D: DEPARTMENT COMPATIBILITY GATE
# ==============================================================================
def check_department_compatibility(selected_dept, predicted_dept, confidence, civic_relevance):
    """
    Evaluates whether user's selected department matches the AI visual evidence.
    Returns: (match_status: str, suggested_dept: str)
    """
    if civic_relevance == "IRRELEVANT":
        return "NOT_APPLICABLE", "UNSUPPORTED"

    if selected_dept == predicted_dept:
        return "MATCH", selected_dept

    # Mismatch when model detects another specific supported department with solid confidence
    if confidence >= 0.50 and selected_dept in DEPT_METRICS and predicted_dept in DEPT_METRICS:
        return "MISMATCH", predicted_dept

    return "MATCH", selected_dept

# ==============================================================================
# STAGE E: DEDICATED SEVERITY ENGINE (EVIDENCE & EXTENT BASED)
# ==============================================================================
def calculate_calibrated_severity(civic_relevance, issue_category, predicted_dept, confidence, quality_metrics):
    """
    Calculates severity (LOW, MEDIUM, HIGH, CRITICAL, or REJECTED_AS_IRRELEVANT)
    based on the actual visible defect, its physical extent (area/depth), and public hazard.
    
    IMPORTANT:
    - Model confidence is NOT severity.
    - Department selection is NOT severity.
    - High-confidence minor issue MUST remain LOW severity.
    - Irrelevant images ALWAYS receive REJECTED_AS_IRRELEVANT and severity_score 0.
    """
    # Rule 1: Irrelevant / Non-Civic Media
    if civic_relevance == "IRRELEVANT":
        return {
            "severity": "REJECTED_AS_IRRELEVANT",
            "severity_score": 0,
            "verification_status": "REJECTED",
            "reasons": [
                "Uploaded photograph is non-civic media (selfie, portrait, food, pet, or domestic object).",
                "Zero civic hazard detected; complaint rejected from municipal dispatch."
            ]
        }

    # Rule 2: Unusable / Ambiguous / Blurry Photo
    if civic_relevance in ["IMAGE_UNUSABLE", "UNCERTAIN"]:
        return {
            "severity": "LOW",
            "severity_score": 15,
            "verification_status": "NEEDS_REVIEW",
            "reasons": [
                "Visual evidence is degraded, blurry, or underexposed.",
                "Severity cannot be safely estimated from pixels; site inspection required."
            ]
        }

    defect_ratio = quality_metrics.get("defect_area_ratio", 0.05)
    edge_density = quality_metrics.get("edge_density", 0.05)
    reasons = []

    # Category 1: Public Safety Critical Hazards (Exposed live wires, open manholes)
    if issue_category == "DANGLING_POWER_CABLE":
        return {
            "severity": "CRITICAL",
            "severity_score": 92,
            "verification_status": "PENDING",
            "reasons": [
                "Exposed electrical wiring or downed power cable in pedestrian/traffic corridor.",
                "Immediate public safety hazard: severe risk of electrocution and electrical fire."
            ]
        }

    if issue_category in ["CLOGGED_DRAIN", "SEWAGE_OVERFLOW"]:
        if defect_ratio > 0.12 or edge_density > 0.15:
            return {
                "severity": "HIGH",
                "severity_score": 78,
                "verification_status": "PENDING",
                "reasons": [
                    f"Substantial drainage overflow occupying ~{int(defect_ratio*100)}% of street surface.",
                    "Active sewage flooding poses severe biohazard contamination and structural road erosion."
                ]
            }
        return {
            "severity": "MEDIUM",
            "severity_score": 52,
            "verification_status": "PENDING",
            "reasons": [
                "Visible storm drain blockage or localized gutter accumulation.",
                "Requires municipal clearance before upcoming rainfall to prevent thoroughfare flooding."
            ]
        }

    # Category 2: Water Supply (Pipe burst vs leakage)
    if issue_category == "WATER_PIPE_BURST":
        return {
            "severity": "HIGH",
            "severity_score": 80,
            "verification_status": "PENDING",
            "reasons": [
                "Pressurized municipal water pipe rupture causing active water loss.",
                "High volume outflow causes road sub-base undermining and water supply disruption."
            ]
        }

    if issue_category == "WATER_LEAKAGE":
        if defect_ratio > 0.10:
            return {
                "severity": "MEDIUM",
                "severity_score": 55,
                "verification_status": "PENDING",
                "reasons": [
                    "Persistent water leakage creating pooling on public pavement.",
                    "Localized resource loss requiring maintenance crew repair."
                ]
            }
        return {
            "severity": "LOW",
            "severity_score": 30,
            "verification_status": "PENDING",
            "reasons": [
                "Minor localized pipe drip or public tap seepage.",
                "Limited public impact; scheduled maintenance recommended."
            ]
        }

    # Category 3: Road Infrastructure (Potholes & Cracks)
    if issue_category == "POTHOLE":
        # Severity is evaluated by physical cavity size and road frame occupation
        if defect_ratio > 0.14:
            return {
                "severity": "HIGH",
                "severity_score": 78,
                "verification_status": "PENDING",
                "reasons": [
                    f"Substantial road crater occupying ~{int(defect_ratio*100)}% of the carriageway frame.",
                    "Significant depth cavity poses acute danger of tire blowout and two-wheeler loss of control."
                ]
            }
        elif defect_ratio > 0.04:
            return {
                "severity": "MEDIUM",
                "severity_score": 58,
                "verification_status": "PENDING",
                "reasons": [
                    f"Distinct road surface depression occupying ~{int(defect_ratio*100)}% of vehicular lane.",
                    "Presents navigation hazard requiring patch and repair crew."
                ]
            }
        else:
            return {
                "severity": "LOW",
                "severity_score": 35,
                "verification_status": "PENDING",
                "reasons": [
                    "Minor road surface crater with limited depth.",
                    "Low immediate danger to vehicular navigation; queue for routine asphalt maintenance."
                ]
            }

    if issue_category == "ROAD_CRACK":
        if edge_density > 0.16:
            return {
                "severity": "MEDIUM",
                "severity_score": 50,
                "verification_status": "PENDING",
                "reasons": [
                    "Extensive alligator cracking pattern across asphalt pavement.",
                    "Structural sub-base compromise imminent if water enters fissures."
                ]
            }
        return {
            "severity": "LOW",
            "severity_score": 25,
            "verification_status": "PENDING",
            "reasons": [
                "Localized hairline surface asphalt crack with intact sub-base.",
                "Non-hazardous to vehicle passage; preventive surface sealing recommended."
            ]
        }

    # Category 4: Sanitation & Garbage
    if issue_category in ["OVERFLOWING_GARBAGE", "SCATTERED_LITTER"]:
        if defect_ratio > 0.15 or edge_density > 0.18:
            return {
                "severity": "HIGH",
                "severity_score": 75,
                "verification_status": "PENDING",
                "reasons": [
                    f"Massive solid waste accumulation occupying ~{int(defect_ratio*100)}% of public thoroughfare.",
                    "Major sanitation hazard blocking pedestrian corridor and breeding disease vectors."
                ]
            }
        elif defect_ratio > 0.05:
            return {
                "severity": "MEDIUM",
                "severity_score": 54,
                "verification_status": "PENDING",
                "reasons": [
                    "Overflowing municipal waste bin with debris scattered around perimeter.",
                    "Sanitation truck dispatch required for routine clearance."
                ]
            }
        else:
            return {
                "severity": "LOW",
                "severity_score": 32,
                "verification_status": "PENDING",
                "reasons": [
                    "Minor litter or isolated waste discarded in public area.",
                    "Localized cleanup required; low public health threat."
                ]
            }

    # Category 5: Electrical & Lighting
    if issue_category == "DAMAGED_STREETLIGHT":
        return {
            "severity": "MEDIUM",
            "severity_score": 50,
            "verification_status": "PENDING",
            "reasons": [
                "Street lighting luminaire or post defect identified.",
                "Causes reduced night visibility in public corridor; electrical crew dispatch needed."
            ]
        }

    if issue_category == "UNSUPPORTED_CATEGORY" or predicted_dept == "UNSUPPORTED":
        return {
            "severity": "LOW",
            "severity_score": 10,
            "verification_status": "NEEDS_REVIEW",
            "reasons": [
                "Uploaded media belongs to an unsupported or deprecated department category.",
                "Manual review required by City Administration for reassignment."
            ]
        }

    # Default fallback
    return {
        "severity": "MEDIUM",
        "severity_score": 45,
        "verification_status": "PENDING",
        "reasons": ["Civic report logged under verified municipal infrastructure category."]
    }

# ==============================================================================
# MULTILINGUAL EXPLANATIONS (EN, HI, MR)
# ==============================================================================
def generate_multilingual_explanations(predicted_dept, issue_category, severity, civic_relevance, dept_match):
    dept_info = DEPT_METRICS.get(predicted_dept, {
        "name_en": "Civic Administration",
        "name_hi": "नागरिक प्रशासन",
        "name_mr": "नागरी प्रशासन"
    })
    dept_en = dept_info["name_en"]
    dept_hi = dept_info["name_hi"]
    dept_mr = dept_info["name_mr"]

    readable_issue = issue_category.replace("_", " ").title()

    if civic_relevance == "IRRELEVANT":
        return {
            "en": "The uploaded photograph appears to be a personal selfie, portrait, food, or non-civic subject. It does not show a public civic infrastructure problem. Please upload a clear photo of the physical problem.",
            "hi": "अपलोड की गई तस्वीर एक व्यक्तिगत सेल्फ़ी, भोजन या असंबंधित विषय प्रतीत होती है। इसमें कोई नागरिक समस्या नहीं दिख रही है। कृपया समस्या की उपयुक्त तस्वीर अपलोड करें।",
            "mr": "अपलोड केलेला फोटो वैयक्तिक सेल्फी, अन्न किंवा असंबंधित विषय असल्याचे दिसते. यात कोणतीही नागरी समस्या दिसत नाही. कृपया समस्येचा स्पष्ट फोटो अपलोड करा."
        }

    if civic_relevance in ["IMAGE_UNUSABLE", "UNCERTAIN"]:
        return {
            "en": "The image is too blurry, dark, or unclear for automated diagnosis. It has been routed for manual inspection by municipal officers.",
            "hi": "छवि स्वचालित निदान के लिए बहुत धुंधली या अंधेरी है। इसे नगर निगम अधिकारियों द्वारा मैन्युअल निरीक्षण के लिए भेजा गया है।",
            "mr": "इमेज खूप अस्पष्ट किंवा गडद आहे. महानगरपालिकेच्या अधिकाऱ्यांकडून मॅन्युअल तपासणीसाठी पाठवण्यात आली आहे."
        }

    if dept_match == "MISMATCH":
        return {
            "en": f"AI visual evidence indicates this {readable_issue} relates to {dept_en}. Department verification recommended.",
            "hi": f"एआई दृश्य साक्ष्यों से संकेत मिलता है कि यह समस्या {dept_hi} विभाग से संबंधित है। विभाग सत्यापन अनुशंसित है।",
            "mr": f"एआय दृश्य पुराव्यांवरून ही समस्या {dept_mr} विभागाशी संबंधित असल्याचे दिसून येते. विभाग पडताळणीची शिफारस केली आहे."
        }

    severity_hi = {"LOW": "कम", "MEDIUM": "मध्यम", "HIGH": "उच्च", "CRITICAL": "अति-गंभीर"}.get(severity, severity)
    severity_mr = {"LOW": "कमी", "MEDIUM": "मध्यम", "HIGH": "उच्च", "CRITICAL": "अति-गंभीर"}.get(severity, severity)

    return {
        "en": f"AI identified visible {readable_issue} under {dept_en} department with {severity} severity.",
        "hi": f"एआई ने {dept_hi} विभाग के तहत {severity_hi} गंभीरता के साथ {readable_issue} की पहचान की है।",
        "mr": f"एआयने {dept_mr} विभागांतर्गत {severity_mr} तीव्रतेसह {readable_issue} ची ओळख पटवली आहे."
    }

# ==============================================================================
# MASTER ENTRY POINT
# ==============================================================================
def analyze_civic_image(image_url, selected_department):
    """
    Comprehensive multi-stage AI analysis pipeline satisfying Step 2-5.
    Returns structured result with:
    - analysis_status
    - civic_relevance
    - issue_category
    - predicted_department
    - classification_confidence
    - department_match
    - severity
    - severity_score
    - severity_reasons
    - verification_status
    - model_version
    + localized explanations & backwards-compatible telemetry fields.
    """
    dept = selected_department or "ROAD"
    logger.info(f"Initiating visual analysis: dept={dept}, image_src={image_url[:50] if image_url else 'None'}")

    # Stage A: Ingest Image
    pil_img, load_err = download_or_load_image(image_url)
    if pil_img is None:
        logger.warning(f"Image load failure: {load_err}")
        return {
            "analysis_status": "FAILED",
            "civic_relevance": "UNCERTAIN",
            "issue_category": "NO_IMAGE_PROVIDED",
            "predicted_department": dept,
            "suggestedDepartment": dept,
            "classification_confidence": 0.0,
            "department_match": "NOT_APPLICABLE",
            "severity": "LOW",
            "severity_score": 15,
            "severity_reasons": ["No readable image was supplied with the report. Physical site inspection required."],
            "verification_status": "NEEDS_REVIEW",
            "model_version": "v3.0-clip-vit-spatial",
            # Backwards compatibility
            "department": dept,
            "priority": "LOW",
            "evidenceScore": 15,
            "confidence": 0.0,
            "civicRelevance": "UNCERTAIN",
            "departmentMatch": "NOT_APPLICABLE",
            "predictedDepartment": dept,
            "predictedIssue": "Unverified Report (No Visual Telemetry)",
            "severityReasons": "No readable image was supplied with the report. Physical site inspection required.",
            "verificationStatus": "NEEDS_REVIEW",
            "aiSummary": "No photograph attached. Complaint registered for site inspection.",
            "aiExplanation": "No photograph attached. Complaint registered for site inspection.",
            "aiExplanationHi": "कोई फ़ोटो संलग्न नहीं है। शिकायत स्थल निरीक्षण के लिए दर्ज की गई है।",
            "aiExplanationMr": "कोणताही फोटो जोडलेला नाही. तक्रार स्थळ तपासणीसाठी नोंदवली आहे.",
            "isFake": False,
            "qualityIndicators": {"status": load_err or "MISSING"}
        }

    # Stage A.2: Physical Quality Validation
    is_usable, quality_code, quality_metrics = validate_image_quality(pil_img)
    if not is_usable:
        relevance = "IMAGE_UNUSABLE"
        explanations = generate_multilingual_explanations(dept, "Unusable Image", "REJECTED_AS_IRRELEVANT", relevance, "MATCH")
        reason_text = quality_metrics.get("reason", "Image is too dark, overexposed, or blank to analyze.")
        return {
            "analysis_status": "COMPLETED",
            "civic_relevance": "IMAGE_UNUSABLE",
            "issue_category": "UNUSABLE_IMAGE",
            "predicted_department": dept,
            "suggestedDepartment": dept,
            "classification_confidence": 0.95,
            "department_match": "NOT_APPLICABLE",
            "severity": "REJECTED_AS_IRRELEVANT",
            "severity_score": 0,
            "severity_reasons": [reason_text],
            "verification_status": "REJECTED",
            "model_version": "v3.0-clip-vit-spatial",
            # Backwards compatibility
            "department": dept,
            "priority": "LOW",
            "evidenceScore": 0,
            "confidence": 0.95,
            "civicRelevance": "IMAGE_UNUSABLE",
            "departmentMatch": "NOT_APPLICABLE",
            "predictedDepartment": dept,
            "predictedIssue": "Unusable Photograph",
            "severityReasons": reason_text,
            "verificationStatus": "REJECTED",
            "aiSummary": explanations["en"],
            "aiExplanation": explanations["en"],
            "aiExplanationHi": explanations["hi"],
            "aiExplanationMr": explanations["mr"],
            "isFake": True,
            "qualityIndicators": quality_metrics
        }

    # Stage B & C: Vision Classification
    vis_res = detect_and_classify_visuals(pil_img, quality_metrics, dept)
    civic_rel = vis_res["civic_relevance"]
    pred_dept = vis_res["predicted_department"]
    issue_cat = vis_res["issue_category"]
    conf = vis_res["classification_confidence"]

    # Stage D: Department Compatibility
    dept_match, suggested_dept = check_department_compatibility(dept, pred_dept, conf, civic_rel)

    # Stage E: Evidence Severity Calculation
    sev_res = calculate_calibrated_severity(civic_rel, issue_cat, pred_dept, conf, quality_metrics)

    # Stage F: Multilingual Explanations
    explanations = generate_multilingual_explanations(pred_dept, issue_cat, sev_res["severity"], civic_rel, dept_match)

    readable_issue = issue_cat.replace("_", " ").title()
    all_reasons = vis_res.get("evidence_reasons", []) + sev_res.get("reasons", [])

    # Map priority for Prisma enum
    raw_severity = sev_res["severity"]
    if raw_severity in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        priority = raw_severity
    else:
        priority = "LOW"

    return {
        "analysis_status": "COMPLETED",
        "civic_relevance": civic_rel,
        "issue_category": issue_cat,
        "predicted_department": pred_dept,
        "classification_confidence": conf,
        "department_match": dept_match,
        "severity": raw_severity,
        "severity_score": sev_res["severity_score"],
        "severity_reasons": all_reasons,
        "verification_status": sev_res["verification_status"],
        "model_version": "v3.0-clip-vit-spatial",
        # Backwards compatibility fields for Prisma and Frontend
        "department": dept,
        "suggestedDepartment": suggested_dept,
        "priority": priority,
        "severityScore": sev_res["severity_score"],
        "confidence": conf,
        "evidenceScore": 85 if civic_rel == "RELEVANT" else 0,
        "civicRelevance": civic_rel,
        "departmentMatch": dept_match,
        "predictedDepartment": pred_dept,
        "predictedIssue": readable_issue,
        "verificationStatus": sev_res["verification_status"],
        "aiSummary": explanations["en"],
        "aiExplanation": explanations["en"],
        "aiExplanationHi": explanations["hi"],
        "aiExplanationMr": explanations["mr"],
        "severityReasons": "; ".join(all_reasons),
        "qualityIndicators": quality_metrics,
        "isFake": (civic_rel == "IRRELEVANT"),
        "modelVersion": "v3.0-clip-vit-spatial"
    }
