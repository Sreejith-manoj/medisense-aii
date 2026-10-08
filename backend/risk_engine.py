"""
Risk and Urgency Classification Engine
Evaluates symptoms for medical red flags and classifies risk into High/Emergency, Moderate, or Low/Informational tiers.
"""

from typing import Dict, List, Any

# Emergency combinations and red flag keywords
EMERGENCY_RULES = [
    {
        "id": "cardiac_emergency",
        "name": "Possible Cardiac Emergency",
        "keywords": ["chest pain", "chest pressure", "radiating pain", "left arm", "jaw pain", "chest tightness"],
        "triggers": [
            ("chest pain", "shortness of breath"),
            ("chest pain", "left arm"),
            ("chest pain", "arm"),
            ("chest pain", "cold sweat"),
            ("chest pain", "jaw"),
            ("chest pressure", "dizziness")
        ],
        "single_triggers": ["chest pressure radiating", "crushing chest pain", "thunderclap headache", "chest pain radiating"],
        "description": "Symptoms may indicate a severe cardiovascular event such as Acute Coronary Syndrome or Heart Attack."
    },
    {
        "id": "stroke_emergency",
        "name": "Possible Cerebrovascular Event (Stroke)",
        "keywords": ["facial drooping", "arm weakness", "slurred speech", "one-sided numbness", "sudden vision loss"],
        "triggers": [
            ("facial drooping", "slurred speech"),
            ("arm weakness", "slurred speech"),
            ("numbness", "facial drooping")
        ],
        "single_triggers": ["facial drooping", "slurred speech", "sudden paralysis", "one-sided arm weakness"],
        "description": "Symptoms strongly align with stroke warning signs (BE-FAST)."
    },
    {
        "id": "respiratory_emergency",
        "name": "Severe Respiratory Distress",
        "keywords": ["shortness of breath", "gasping", "bluish lips", "cannot breathe", "stridor"],
        "triggers": [
            ("shortness of breath", "bluish lips"),
            ("shortness of breath", "chest pain"),
            ("unable to speak full sentences", "wheezing")
        ],
        "single_triggers": ["bluish lips", "gasping for air", "stridor"],
        "description": "Potential acute respiratory compromise or severe airway inflammation."
    },
    {
        "id": "neurological_red_flag",
        "name": "Severe Neurological Red Flag",
        "keywords": ["thunderclap", "stiff neck with fever", "sudden severe headache", "confusion", "seizure"],
        "triggers": [
            ("stiff neck", "fever"),
            ("thunderclap headache", "vomiting"),
            ("head injury", "confusion")
        ],
        "single_triggers": ["thunderclap headache", "sudden severe thunderclap", "stiff neck with high fever"],
        "description": "Red flags associated with potential intracranial hemorrhage or meningitis."
    },
    {
        "id": "anaphylaxis_emergency",
        "name": "Possible Anaphylaxis (Severe Allergy)",
        "keywords": ["throat swelling", "lip swelling", "tongue swelling", "hives with breathing difficulty"],
        "triggers": [
            ("throat swelling", "difficulty breathing"),
            ("lip swelling", "shortness of breath"),
            ("hives", "throat tightness")
        ],
        "single_triggers": ["throat swelling", "swelling of tongue and throat", "anaphylaxis"],
        "description": "Severe systemic allergic reaction causing airway compromise."
    }
]

MODERATE_RULES = [
    {"keywords": ["persistent fever", "fever > 102", "high fever"], "name": "Sustained High Fever"},
    {"keywords": ["severe abdominal pain", "right lower stomach", "blood in stool", "blood in vomit"], "name": "Severe Gastrointestinal Distress"},
    {"keywords": ["flank pain", "kidney pain", "burning urination with fever"], "name": "Possible Kidney / Severe UTI"},
    {"keywords": ["dehydration", "cannot keep liquids down", "no urine for 8 hours"], "name": "Dehydration Risk"}
]

class RiskEngine:
    def __init__(self):
        pass

    def evaluate_risk(self, text: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        user_context = user_context or {}
        full_text = f"{text} {user_context.get('severity', '')} {user_context.get('associated_symptoms', '')}".lower()

        detected_emergencies = []
        is_emergency = False

        # 1. Check Emergency Rules
        for rule in EMERGENCY_RULES:
            # Check single triggers
            for st in rule["single_triggers"]:
                if st in full_text:
                    is_emergency = True
                    if rule["name"] not in detected_emergencies:
                        detected_emergencies.append(rule["name"])
                    break
            
            # Check tuple triggers
            for t1, t2 in rule["triggers"]:
                if t1 in full_text and t2 in full_text:
                    is_emergency = True
                    if rule["name"] not in detected_emergencies:
                        detected_emergencies.append(rule["name"])
                    break

        # Check severity indicator
        severity_val = str(user_context.get("severity", "")).lower()
        if "9" in severity_val or "10" in severity_val or "extreme" in severity_val or "unbearable" in severity_val:
            if "chest" in full_text or "headache" in full_text or "breath" in full_text:
                is_emergency = True
                if "Extreme Pain / High Severity" not in detected_emergencies:
                    detected_emergencies.append("Extreme Pain / High Severity")

        if is_emergency:
            return {
                "urgency_level": "EMERGENCY",
                "urgency_score": 95,
                "color": "red",
                "badge_text": "HIGH URGENCY - EMERGENCY RED FLAG DETECTED",
                "alert_title": "URGENT MEDICAL ATTENTION REQUIRED",
                "alert_message": "Your reported symptoms match patterns commonly associated with medical emergencies. Please seek immediate emergency medical care or call 911 / your local emergency hotline without delay.",
                "reasons": detected_emergencies,
                "recommended_action": "Go to the nearest Emergency Room (ER) or call emergency services immediately. Do not attempt to drive yourself if experiencing severe chest pain, stroke signs, or severe breathlessness.",
                "disclaimer": "DISCLAIMER: This software is an informational decision-support demonstration tool and NOT a medical diagnostic system. It does not replace professional emergency medical care."
            }

        # 2. Check Moderate Risk
        detected_moderate = []
        for mod in MODERATE_RULES:
            for kw in mod["keywords"]:
                if kw in full_text:
                    detected_moderate.append(mod["name"])
                    break

        if detected_moderate or "moderate" in severity_val or "4-6" in severity_val or "7-8" in severity_val:
            return {
                "urgency_level": "MODERATE",
                "urgency_score": 55,
                "color": "amber",
                "badge_text": "MODERATE URGENCY - DOCTOR CONSULTATION ADVISED",
                "alert_title": "Medical Evaluation Recommended",
                "alert_message": "Your symptoms warrant prompt professional healthcare evaluation. Consider scheduling a clinic or doctor consultation within 24 to 48 hours.",
                "reasons": detected_moderate if detected_moderate else ["Persistent or moderate symptom profile"],
                "recommended_action": "Contact your primary care physician, visit an urgent care center, or schedule a telehealth appointment for an accurate clinical assessment.",
                "disclaimer": "DISCLAIMER: This system provides general educational health information only and is not a medical diagnosis."
            }

        # 3. Default Low Urgency / Informational
        return {
            "urgency_level": "LOW",
            "urgency_score": 20,
            "color": "green",
            "badge_text": "LOW URGENCY - INFORMATIONAL ONLY",
            "alert_title": "General Health Information",
            "alert_message": "Your description appears consistent with non-urgent, routine, or self-limiting symptoms. Below is educational information retrieved from trusted health references.",
            "reasons": ["No emergency red flags detected"],
            "recommended_action": "Monitor symptoms at home. Practice rest, adequate hydration, and self-care. Consult a doctor if symptoms worsen, persist beyond a few days, or new symptoms develop.",
            "disclaimer": "DISCLAIMER: Educational tool only. Always consult a licensed physician for diagnosis and medical advice."
        }
