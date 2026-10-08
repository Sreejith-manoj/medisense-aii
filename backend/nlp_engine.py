"""
NLP Engine for Symptom Extraction and Context Refinement
Extracts key symptom terms, calculates clinical completeness metrics, and generates targeted follow-up questions.
"""

import re
from typing import Dict, List, Any, Optional

SYMPTOM_LEXICON = {
    "headache": ["headache", "head pain", "head throbbing", "migraine", "head hurt", "pain in head", "tight band around head", "forehead pain"],
    "chest_pain": ["chest pain", "chest tightness", "chest pressure", "pain in chest", "squeezing chest", "heavy chest", "angina"],
    "shortness_of_breath": ["shortness of breath", "breathless", "difficulty breathing", "hard to breathe", "can't catch breath", "dyspnea", "gasping", "wheezing"],
    "fever": ["fever", "high temperature", "chills", "feeling hot", "feverish", "sweats", "pyrexia"],
    "cough": ["cough", "coughing", "dry cough", "wet cough", "coughing up mucus", "hacking cough", "bronchitis cough"],
    "nausea": ["nausea", "nauseous", "feeling sick", "stomach squeamish", "queasy"],
    "vomiting": ["vomiting", "vomit", "throwing up", "threw up", "emesis"],
    "abdominal_pain": ["abdominal pain", "stomach pain", "belly ache", "stomach ache", "gut pain", "stomach cramp", "stomach discomfort"],
    "dizziness": ["dizziness", "dizzy", "lightheaded", "head spinning", "vertigo", "unsteady"],
    "fatigue": ["fatigue", "tired", "exhausted", "low energy", "lethargic", "weariness", "malaise"],
    "sore_throat": ["sore throat", "throat pain", "scratchy throat", "painful swallowing", "pharyngitis"],
    "back_pain": ["back pain", "lower back pain", "back ache", "stiff back", "sciatica", "pain in back", "lumbar pain"],
    "urinary_burning": ["burning urination", "painful pee", "burning when peeing", "dysuria", "frequent urination", "urinary pain"],
    "numbness": ["numbness", "tingling", "pins and needles", "loss of sensation", "arm weakness", "facial drooping", "paralysis"],
    "rash": ["rash", "hives", "itchy skin", "skin redness", "bumps on skin", "urticaria"],
    "light_sensitivity": ["light sensitivity", "sensitive to light", "photophobia", "eyes hurt in light"]
}

DEFAULT_QUESTIONS = [
    {
        "id": "duration",
        "question": "How long have you been experiencing these symptoms?",
        "options": ["Less than 24 hours", "1 - 3 days", "4 - 7 days", "More than a week"],
        "field": "duration"
    },
    {
        "id": "severity",
        "question": "On a scale of 1 to 10 (where 10 is unbearable), how severe is the discomfort?",
        "options": ["Mild (1-3)", "Moderate (4-6)", "Severe (7-8)", "Extreme / Unbearable (9-10)"],
        "field": "severity"
    },
    {
        "id": "onset",
        "question": "Did the symptoms start suddenly or build up gradually over time?",
        "options": ["Sudden onset (appeared abruptly)", "Gradual onset (built up slowly)"],
        "field": "onset"
    }
]

SYMPTOM_SPECIFIC_QUESTIONS = {
    "headache": {
        "id": "associated_symptoms",
        "question": "Do you also experience light sensitivity, nausea, neck stiffness, or vision changes?",
        "options": ["Sensitive to light or sound", "Nausea or vomiting", "Stiff neck or fever", "Vision changes", "None of these"],
        "field": "associated_symptoms"
    },
    "chest_pain": {
        "id": "associated_symptoms",
        "question": "Does the pain spread to your left arm, jaw, or neck, or worsen with deep breathing?",
        "options": ["Radiates to arm, shoulder, or jaw", "Shortness of breath or cold sweat", "Sharp pain when breathing in", "None of these"],
        "field": "associated_symptoms"
    },
    "abdominal_pain": {
        "id": "associated_symptoms",
        "question": "Where is the pain concentrated, and is there any vomiting or fever?",
        "options": ["Right lower stomach", "Upper stomach", "Generalized cramping", "Accompanied by high fever or bloody stool"],
        "field": "associated_symptoms"
    },
    "shortness_of_breath": {
        "id": "associated_symptoms",
        "question": "Is the shortness of breath present even while resting, or only during physical exertion?",
        "options": ["Present at rest", "Only during activity/exertion", "Accompanied by wheezing or chest tightness"],
        "field": "associated_symptoms"
    }
}

class NLPEngine:
    def __init__(self):
        pass

    def extract_symptoms(self, text: str) -> List[str]:
        text_lower = text.lower()
        found = set()
        for canonical, phrases in SYMPTOM_LEXICON.items():
            for phrase in phrases:
                if re.search(r'\b' + re.escape(phrase) + r'\b', text_lower):
                    found.add(canonical)
                    break
        return list(found)

    def analyze_context_completeness(self, text: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        user_context = user_context or {}
        text_lower = text.lower()
        extracted_symptoms = self.extract_symptoms(text)

        has_duration = bool(re.search(r'(\d+\s*(day|hour|week|month)|yesterday|today|few days|since)', text_lower)) or "duration" in user_context
        has_severity = bool(re.search(r'(\b[1-9]\s*/\s*10\b|severe|mild|moderate|unbearable|terrible|bad)', text_lower)) or "severity" in user_context
        has_onset = bool(re.search(r'(sudden|gradual|abrupt|started all of a sudden)', text_lower)) or "onset" in user_context

        missing_fields = []
        follow_up_questions = []

        total_criteria = 3.0
        met_criteria = 0.0

        if has_severity:
            met_criteria += 1.0
        else:
            missing_fields.append("severity")
            follow_up_questions.append(DEFAULT_QUESTIONS[1])

        if has_duration:
            met_criteria += 1.0
        else:
            missing_fields.append("duration")
            follow_up_questions.append(DEFAULT_QUESTIONS[0])

        if has_onset:
            met_criteria += 1.0
        else:
            missing_fields.append("onset")
            follow_up_questions.append(DEFAULT_QUESTIONS[2])

        for sym in extracted_symptoms:
            if sym in SYMPTOM_SPECIFIC_QUESTIONS and "associated_symptoms" not in user_context:
                spec_q = SYMPTOM_SPECIFIC_QUESTIONS[sym]
                if spec_q not in follow_up_questions:
                    follow_up_questions.append(spec_q)

        completeness_score = int((met_criteria / total_criteria) * 100)
        is_complete = (completeness_score >= 100 or len(user_context) > 0) or len(follow_up_questions) == 0

        return {
            "extracted_symptoms": extracted_symptoms,
            "has_duration": has_duration,
            "has_severity": has_severity,
            "has_onset": has_onset,
            "missing_fields": missing_fields,
            "follow_up_questions": follow_up_questions[:3],
            "completeness_score": completeness_score,
            "is_complete": is_complete
        }

    def build_structured_query(self, initial_text: str, context: Dict[str, Any]) -> str:
        query_parts = [f"Initial Description: {initial_text}"]

        if context.get("severity"):
            query_parts.append(f"Severity: {context['severity']}")
        if context.get("duration"):
            query_parts.append(f"Duration: {context['duration']}")
        if context.get("onset"):
            query_parts.append(f"Onset: {context['onset']}")
        if context.get("associated_symptoms"):
            query_parts.append(f"Associated Symptoms: {context['associated_symptoms']}")

        return " | ".join(query_parts)
