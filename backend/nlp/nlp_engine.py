"""
MediSense AI - NLP Symptom Understanding Engine
Extracts clinical entities (symptom, body_location, duration, severity, onset, quality, triggers, associated_symptoms).
"""

import re
from typing import Dict, List, Any, Optional

SYMPTOM_ENTITIES = {
    "headache": {
        "canonical": "headache",
        "synonyms": ["headache", "head pain", "head throbbing", "migraine", "head hurt", "pain in head", "tight band around head", "forehead pain"],
        "category": "Neurology",
        "questions": [
            {"id": "location", "question": "Where on your head is the pain located?", "options": ["One side of head (unilateral)", "Both sides (bilateral)", "Forehead or temples", "Back of head/neck"], "reason": "Unilateral throbbing pain suggests migraine, while bilateral band-like pain suggests tension headache."},
            {"id": "onset", "question": "Did the headache start suddenly or build up gradually?", "options": ["Sudden (thunderclap / instant)", "Gradual over hours"], "reason": "Sudden 'thunderclap' onset is a neurological red flag requiring immediate emergency evaluation."},
            {"id": "associated_symptoms", "question": "Do you also experience light sensitivity, nausea, or neck stiffness?", "options": ["Sensitive to light or sound", "Nausea or vomiting", "Stiff neck with fever", "Vision changes / aura", "None of these"], "reason": "Photophobia and nausea accompany migraines; neck stiffness with fever indicates possible meningitis."}
        ]
    },
    "chest_pain": {
        "canonical": "chest_pain",
        "synonyms": ["chest pain", "chest tightness", "chest pressure", "pain in chest", "squeezing chest", "heavy chest", "angina"],
        "category": "Cardiology",
        "questions": [
            {"id": "onset", "question": "Did the chest discomfort begin abruptly?", "options": ["Sudden onset", "Gradual onset"], "reason": "Abrupt chest pressure is a cardinal indicator of potential acute coronary events."},
            {"id": "radiation", "question": "Does the pain spread to your left arm, shoulder, jaw, or neck?", "options": ["Radiates to left arm / shoulder", "Radiates to jaw or neck", "Stays in center of chest", "None of these"], "reason": "Radiation to left arm or jaw is a classic sign of myocardial ischemia."},
            {"id": "associated_symptoms", "question": "Are you experiencing shortness of breath, cold sweating, or dizziness?", "options": ["Shortness of breath", "Cold sweating", "Dizziness or fainting", "None of these"], "reason": "Dyspnea and diaphoresis alongside chest pain strongly elevate cardiac urgency."}
        ]
    },
    "shortness_of_breath": {
        "canonical": "shortness_of_breath",
        "synonyms": ["shortness of breath", "breathless", "difficulty breathing", "hard to breathe", "can't catch breath", "dyspnea", "gasping", "wheezing"],
        "category": "Respiratory",
        "questions": [
            {"id": "exertion", "question": "Is the breathlessness present even while resting?", "options": ["Present at rest", "Only during physical activity", "Worse when lying flat"], "reason": "Resting dyspnea or orthopnea signifies severe pulmonary or cardiac compromise."},
            {"id": "associated_symptoms", "question": "Do you notice wheezing, chest tightness, or bluish skin tone?", "options": ["Wheezing or whistling sound", "Chest tightness", "Bluish lips or fingernails", "None of these"], "reason": "Cyanosis (bluish lips) indicates severe hypoxemia requiring immediate emergency intervention."}
        ]
    },
    "cough": {
        "canonical": "cough",
        "synonyms": ["cough", "coughing", "dry cough", "wet cough", "coughing up mucus", "hacking cough", "bronchitis cough"],
        "category": "Respiratory",
        "questions": [
            {"id": "duration", "question": "How long have you had this cough?", "options": ["Less than 3 days", "3 to 7 days", "1 to 3 weeks", "More than 3 weeks"], "reason": "Acute coughs (<3 weeks) usually reflect viral URIs; chronic coughs warrant medical investigation."},
            {"id": "fever", "question": "Do you have an accompanying fever?", "options": ["High fever (>101°F)", "Mild fever", "No fever"], "reason": "Fever with cough helps distinguish lower respiratory bacterial infection from non-infectious causes."}
        ]
    },
    "abdominal_pain": {
        "canonical": "abdominal_pain",
        "synonyms": ["abdominal pain", "stomach pain", "belly ache", "stomach ache", "gut pain", "stomach cramp", "stomach discomfort"],
        "category": "Gastroenterology",
        "questions": [
            {"id": "location", "question": "Which area of your abdomen hurts most?", "options": ["Right lower stomach", "Upper middle stomach", "Around belly button", "Generalized cramping"], "reason": "Localized right lower quadrant pain is a classic presentation sign for acute appendicitis."},
            {"id": "associated_symptoms", "question": "Are you experiencing severe vomiting, fever, or blood in stool?", "options": ["Persistent vomiting", "High fever", "Blood in stool or vomit", "None of these"], "reason": "Hematemesis or hematochezia represents gastrointestinal bleeding requiring urgent care."}
        ]
    },
    "urinary_burning": {
        "canonical": "urinary_burning",
        "synonyms": ["burning urination", "painful pee", "burning when peeing", "dysuria", "frequent urination", "urinary pain"],
        "category": "Urology",
        "questions": [
            {"id": "associated_symptoms", "question": "Do you have upper back/flank pain, fever, or chills?", "options": ["Back or flank pain", "Fever and chills", "Cloudy or smelly urine", "None of these"], "reason": "Flank pain with fever suggests upper UTI (pyelonephritis) rather than simple cystitis."}
        ]
    },
    "back_pain": {
        "canonical": "back_pain",
        "synonyms": ["back pain", "lower back pain", "back ache", "stiff back", "sciatica", "pain in back", "lumbar pain"],
        "category": "Musculoskeletal",
        "questions": [
            {"id": "triggers", "question": "Did the pain start after heavy lifting or sudden movement?", "options": ["After heavy lifting / exercise", "Gradual onset over weeks", "After a fall or injury"], "reason": "Acute strain following mechanical load suggests musculoskeletal etiology."},
            {"id": "associated_symptoms", "question": "Do you have leg numbness or bowel/bladder control changes?", "options": ["Loss of bowel/bladder control", "Numbness between legs", "Leg weakness", "None of these"], "reason": "Incontinence or saddle anesthesia indicates Cauda Equina Syndrome, an emergency."}
        ]
    },
    "numbness": {
        "canonical": "numbness",
        "synonyms": ["numbness", "tingling", "pins and needles", "loss of sensation", "arm weakness", "facial drooping", "paralysis"],
        "category": "Neurology",
        "questions": [
            {"id": "location", "question": "Is the weakness or numbness on one side of your face or body?", "options": ["One side of face or arm", "Both arms/legs", "Fingertips only"], "reason": "Unilateral facial drooping or arm weakness is a key BE-FAST stroke indicator."}
        ]
    },
    "fever": {
        "canonical": "fever",
        "synonyms": ["fever", "high temperature", "chills", "feeling hot", "feverish", "pyrexia"],
        "category": "Primary Care",
        "questions": [
            {"id": "duration", "question": "How many days has the fever persisted?", "options": ["1 to 2 days", "3 to 5 days", "More than 5 days"], "reason": "Persistent fever beyond 3 days requires evaluation for bacterial co-infections."}
        ]
    },
    "hypoglycemia": {
        "canonical": "hypoglycemia",
        "synonyms": ["shaking", "low blood sugar", "sweating and shaking", "diabetic low", "fast heartbeat and dizzy"],
        "category": "Endocrinology",
        "questions": [
            {"id": "associated_symptoms", "question": "Do you have diabetes or take insulin/glucose medications?", "options": ["Yes, take insulin or diabetes meds", "No diabetes history"], "reason": "Helps distinguish acute hypoglycemic episode from panic or anxiety symptoms."}
        ]
    }
}

BODY_LOCATIONS = {
    "head": ["head", "forehead", "temple", "temples", "scalp", "neck"],
    "chest": ["chest", "sternum", "ribs", "heart region"],
    "abdomen": ["stomach", "abdomen", "belly", "gut", "flank"],
    "back": ["back", "lower back", "spine", "lumbar"],
    "limbs": ["arm", "left arm", "right arm", "leg", "thigh", "foot", "hand", "face"]
}

QUALITIES = ["throbbing", "dull", "sharp", "crushing", "squeezing", "burning", "aching", "stabbing", "tight"]

class NLPEngine:
    def __init__(self):
        pass

    def parse_symptom_entities(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        extracted_symptoms = []
        primary_category = "General"
        
        # 1. Match canonical symptoms
        for key, info in SYMPTOM_ENTITIES.items():
            for syn in info["synonyms"]:
                if re.search(r'\b' + re.escape(syn) + r'\b', text_lower):
                    extracted_symptoms.append(key)
                    if primary_category == "General":
                        primary_category = info["category"]
                    break

        # 2. Extract Body Location
        found_locations = []
        for loc, keywords in BODY_LOCATIONS.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    found_locations.append(kw)
                    break

        # 3. Extract Quality
        found_qualities = [q for q in QUALITIES if q in text_lower]

        # 4. Extract Duration & Severity
        duration_match = re.search(r'(\d+\s*(day|days|hour|hours|week|weeks|month)|yesterday|today|since last night)', text_lower)
        duration_val = duration_match.group(0) if duration_match else None

        severity_match = re.search(r'(\b[1-9]\b\s*/\s*10|severe|mild|moderate|unbearable|terrible)', text_lower)
        severity_val = severity_match.group(0) if severity_match else None

        onset_match = re.search(r'(sudden|abrupt|gradual|started all of a sudden)', text_lower)
        onset_val = onset_match.group(0) if onset_match else None

        triggers_match = re.search(r'(light|sound|movement|lifting|exercise|eating)', text_lower)
        triggers_val = triggers_match.group(0) if triggers_match else None

        # Completeness calculation
        total_slots = 4.0
        filled_slots = 0.0
        if extracted_symptoms: filled_slots += 1.0
        if duration_val: filled_slots += 1.0
        if severity_val: filled_slots += 1.0
        if onset_val or found_qualities or found_locations: filled_slots += 1.0

        completeness_pct = int((filled_slots / total_slots) * 100)

        return {
            "extracted_symptoms": extracted_symptoms,
            "primary_category": primary_category,
            "body_location": found_locations[0] if found_locations else "unspecified",
            "quality": found_qualities[0] if found_qualities else "unspecified",
            "duration": duration_val,
            "severity": severity_val,
            "onset": onset_val,
            "triggers": triggers_val,
            "completeness_score": completeness_pct,
            "is_complete": completeness_pct >= 75
        }

    def select_adaptive_questions(self, parsed_entities: Dict[str, Any], answered_keys: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        answered_keys = answered_keys or {}
        extracted = parsed_entities.get("extracted_symptoms", [])
        
        adaptive_qs = []

        # 1. PRIORITIZE DISEASE-SPECIFIC QUESTIONS FIRST
        for sym in extracted:
            if sym in SYMPTOM_ENTITIES:
                spec_qs = SYMPTOM_ENTITIES[sym].get("questions", [])
                for q in spec_qs:
                    if q["id"] not in answered_keys and q not in adaptive_qs:
                        adaptive_qs.append(q)

        # 2. Add Symptom Duration question if missing
        if not parsed_entities.get("duration") and "duration" not in answered_keys:
            adaptive_qs.append({
                "id": "duration",
                "question": "Symptom Duration: How long have you been experiencing these symptoms?",
                "options": ["Less than 24 hours", "1 - 3 days", "4 - 7 days", "1 - 3 weeks", "More than a month"],
                "reason": "Duration distinguishes acute clinical episodes from chronic medical conditions."
            })

        # 3. Add Pain / Severity scale if missing
        if not parsed_entities.get("severity") and "severity" not in answered_keys:
            adaptive_qs.append({
                "id": "severity",
                "question": "Pain & Discomfort Intensity: On a scale of 1 to 10, how intense is the sensation?",
                "options": ["Mild (1-3)", "Moderate (4-6)", "Severe (7-8)", "Extreme / Unbearable (9-10)"],
                "reason": "Numeric rating scale directly informs the machine learning urgency classifier."
            })

        # 4. Add Onset Pattern question if missing
        if not parsed_entities.get("onset") and "onset" not in answered_keys:
            adaptive_qs.append({
                "id": "onset",
                "question": "Onset & Progression Pattern: How quickly did these symptoms appear?",
                "options": ["Sudden (instant / within minutes)", "Gradual over several hours", "Progressive worsening over days", "Intermittent / Comes and goes"],
                "reason": "Sudden onset often triggers high emergency priority in clinical triage."
            })

        # 5. Add Relevant Medical History if missing
        if "history" not in answered_keys:
            adaptive_qs.append({
                "id": "history",
                "question": "Relevant Personal Medical History / Comorbidities:",
                "options": ["High Blood Pressure / Hypertension", "Diabetes or Insulin use", "Asthma / COPD", "Cardiac / Heart condition", "No prior medical conditions"],
                "reason": "Comorbidities alter baseline clinical risk score in triage algorithms."
            })

        return adaptive_qs[:5] # Return top targeted clinical questions



    def build_structured_query(self, initial_text: str, context: Optional[Dict[str, Any]] = None) -> str:
        context = context or {}
        parsed = self.parse_symptom_entities(initial_text)
        symptoms = ", ".join(parsed.get("extracted_symptoms", [])) or initial_text
        location = parsed.get("body_location", "")
        quality = parsed.get("quality", "")
        duration = context.get("duration") or parsed.get("duration") or ""
        severity = context.get("severity") or parsed.get("severity") or ""
        
        parts = [symptoms]
        if location and location != "unspecified":
            parts.append(f"in {location}")
        if quality and quality != "unspecified":
            parts.append(f"described as {quality}")
        if duration:
            parts.append(f"lasting {duration}")
        if severity:
            parts.append(f"with {severity}")
            
        return " ".join(parts)
