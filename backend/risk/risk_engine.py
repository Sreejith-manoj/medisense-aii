"""
MediSense AI - Safety & Emergency Red-Flag Triage Engine
Screens symptom inputs against cardiovascular, cerebrovascular, respiratory, and neurological red flags.
"""

from typing import Dict, List, Any

EMERGENCY_RULES = [
    {
        "id": "cardiac_emergency",
        "name": "Possible Cardiac Emergency",
        "single_triggers": [
            "chest pressure radiating", "crushing chest pain", "chest pain radiating to arm",
            "chest pain with cold sweat", "radiates to left arm", "radiates to jaw or neck", "sudden onset"
        ],
        "triggers": [("chest", "left arm"), ("chest", "jaw"), ("chest", "shortness of breath"), ("chest", "cold sweat")],
        "description": "Symptoms may indicate acute coronary syndrome or myocardial infarction."
    },
    {
        "id": "stroke_emergency",
        "name": "Possible Cerebrovascular Event (Stroke)",
        "single_triggers": [
            "facial drooping", "slurred speech", "one-sided arm weakness", "sudden paralysis",
            "one side of face or arm", "one side of body"
        ],
        "triggers": [("arm weakness", "slurred speech"), ("facial drooping", "numbness"), ("face", "weakness")],
        "description": "Symptoms strongly align with stroke warning signs (BE-FAST protocol)."
    },
    {
        "id": "respiratory_emergency",
        "name": "Severe Respiratory Distress",
        "single_triggers": [
            "bluish lips", "bluish lips or fingernails", "gasping for air", "stridor", "present at rest"
        ],
        "triggers": [("shortness of breath", "bluish lips"), ("difficulty breathing", "chest pain"), ("breath", "rest")],
        "description": "Acute respiratory compromise requiring urgent airway intervention."
    },
    {
        "id": "neurological_red_flag",
        "name": "Severe Neurological Red Flag",
        "single_triggers": [
            "thunderclap headache", "sudden (thunderclap / instant)", "stiff neck with fever", "stiff neck with high fever"
        ],
        "triggers": [("stiff neck", "fever"), ("thunderclap", "headache"), ("sudden", "headache")],
        "description": "Red flags associated with intracranial hemorrhage or meningitis."
    },
    {
        "id": "cauda_equina_emergency",
        "name": "Cauda Equina Syndrome Red Flag",
        "single_triggers": [
            "loss of bowel/bladder control", "numbness between legs", "incontinence"
        ],
        "triggers": [("back pain", "bowel"), ("back pain", "numbness")],
        "description": "Saddle anesthesia or acute incontinence indicates spinal emergency."
    }
]

class RiskEngine:
    def __init__(self):
        pass

    def evaluate_risk(self, text: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        user_context = user_context or {}
        context_values = " ".join([str(v) for v in user_context.values() if v])
        full_text = f"{text} {context_values}".lower()

        detected_emergencies = []
        is_emergency = False

        for rule in EMERGENCY_RULES:
            for st in rule["single_triggers"]:
                if st in full_text:
                    is_emergency = True
                    if rule["name"] not in detected_emergencies:
                        detected_emergencies.append(rule["name"])
                    break
            
            for t1, t2 in rule["triggers"]:
                if t1 in full_text and t2 in full_text:
                    is_emergency = True
                    if rule["name"] not in detected_emergencies:
                        detected_emergencies.append(rule["name"])
                    break

        severity_val = str(user_context.get("severity", "")).lower()
        if "9" in severity_val or "10" in severity_val or "extreme" in severity_val or "unbearable" in severity_val:
            if any(k in full_text for k in ["chest", "headache", "head", "breath", "pain", "stomach", "back"]):
                is_emergency = True
                if "Extreme Intensity / High Severity" not in detected_emergencies:
                    detected_emergencies.append("Extreme Intensity / High Severity")


        if is_emergency:
            return {
                "urgency_level": "EMERGENCY",
                "urgency_score": 95,
                "color": "red",
                "badge_text": "HIGH URGENCY - EMERGENCY RED FLAG DETECTED",
                "alert_title": "URGENT MEDICAL ATTENTION REQUIRED",
                "alert_message": "Your reported symptoms match warning patterns commonly associated with medical emergencies. Seek immediate emergency care or call 911 / emergency hotline.",
                "reasons": detected_emergencies,
                "recommended_action": "Call 911 / emergency hotline or go to the nearest ER immediately. Do not attempt to drive yourself if experiencing severe chest pain or stroke signs.",
                "disclaimer": "DISCLAIMER: MediSense AI is an educational decision-support demonstration model and NOT a medical diagnostic system."
            }

        if "moderate" in severity_val or "4-6" in severity_val or "7-8" in severity_val or "fever" in full_text:
            return {
                "urgency_level": "MODERATE",
                "urgency_score": 55,
                "color": "amber",
                "badge_text": "MODERATE URGENCY - DOCTOR CONSULTATION ADVISED",
                "alert_title": "Healthcare Evaluation Recommended",
                "alert_message": "Your symptom profile warrants prompt professional evaluation. Consider scheduling a clinic visit within 24–48 hours.",
                "reasons": ["Sustained or moderate intensity symptom profile"],
                "recommended_action": "Contact your primary care physician or schedule a clinic consultation.",
                "disclaimer": "DISCLAIMER: MediSense AI provides educational health information only and is not a clinical diagnosis."
            }

        return {
            "urgency_level": "LOW",
            "urgency_score": 20,
            "color": "green",
            "badge_text": "LOW URGENCY - INFORMATIONAL ONLY",
            "alert_title": "General Educational Information",
            "alert_message": "Your description appears consistent with non-urgent, self-limiting symptoms. Educational references are retrieved below.",
            "reasons": ["No emergency red flags detected"],
            "recommended_action": "Monitor symptoms at home. Practice adequate rest and hydration. Consult a physician if symptoms worsen.",
            "disclaimer": "DISCLAIMER: Educational tool only. Always consult a physician for healthcare decisions."
        }
