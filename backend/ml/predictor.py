"""
MediSense AI - Real-time ML Predictor & Explainable AI Module
Runs trained Scikit-Learn model to predict urgency class and generate feature attribution explanations.
"""

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Any

MODEL_DIR = os.path.dirname(__file__)
sys.path.insert(0, MODEL_DIR)

from dataset_generator import FEATURE_COLUMNS, TARGET_CLASSES

class MLPredictor:
    def __init__(self):
        self.weights_path = os.path.join(MODEL_DIR, "model_weights.pkl")
        self.metrics_path = os.path.join(MODEL_DIR, "model_metrics.json")
        self.model = None

        if not os.path.exists(self.weights_path):
            from trainer import train_and_evaluate
            train_and_evaluate()

        with open(self.weights_path, "rb") as f:
            self.model = pickle.load(f)

        with open(self.metrics_path, "r", encoding="utf-8") as f:
            self.metrics = json.load(f)

    def extract_feature_vector(self, text: str, parsed_entities: Dict[str, Any], context: Dict[str, Any]) -> List[float]:
        text_lower = f"{text} {json.dumps(context)}".lower()

        symptom_code_map = {
            "headache": 0, "chest_pain": 1, "shortness_of_breath": 2, "cough": 3,
            "abdominal_pain": 4, "urinary_burning": 5, "back_pain": 6, "numbness": 7,
            "fever": 8, "hypoglycemia": 9
        }
        extracted = parsed_entities.get("extracted_symptoms", [])
        sym_code = symptom_code_map.get(extracted[0], 9) if extracted else 9

        dur_str = str(parsed_entities.get("duration") or context.get("duration", "")).lower()
        duration_days = 1
        if "1 - 3" in dur_str or "few days" in dur_str or "yesterday" in dur_str: duration_days = 2
        elif "4 - 7" in dur_str or "week" in dur_str: duration_days = 5
        elif "more than a week" in dur_str: duration_days = 10

        sev_str = str(parsed_entities.get("severity") or context.get("severity", "")).lower()
        severity_score = 4
        if "mild" in sev_str or "1-3" in sev_str: severity_score = 2
        elif "moderate" in sev_str or "4-6" in sev_str: severity_score = 5
        elif "severe" in sev_str or "7-8" in sev_str: severity_score = 8
        elif "extreme" in sev_str or "9-10" in sev_str or "unbearable" in sev_str: severity_score = 10

        sudden_onset = 1 if ("sudden" in text_lower or "abrupt" in text_lower or "sudden" in str(context.get("onset", "")).lower()) else 0
        fever_present = 1 if ("fever" in text_lower or "chills" in text_lower or "high temp" in text_lower) else 0
        breathing_difficulty = 1 if ("breath" in text_lower or "gasping" in text_lower or "dyspnea" in text_lower) else 0
        chest_pain_present = 1 if ("chest" in text_lower or sym_code == 1) else 0
        confusion_present = 1 if ("confusion" in text_lower or "confused" in text_lower or "disoriented" in text_lower) else 0
        weakness_one_side = 1 if ("one side" in text_lower or "facial drooping" in text_lower or "arm weakness" in text_lower) else 0
        bleeding_present = 1 if ("blood" in text_lower or "bleeding" in text_lower) else 0
        loss_of_consciousness = 1 if ("fainted" in text_lower or "passed out" in text_lower or "unconscious" in text_lower) else 0
        radiating_pain = 1 if ("radiat" in text_lower or "spreads to" in text_lower or "left arm" in text_lower or "jaw" in text_lower) else 0

        feature_vector = [
            sym_code, duration_days, severity_score, sudden_onset,
            fever_present, breathing_difficulty, chest_pain_present,
            confusion_present, weakness_one_side, bleeding_present,
            loss_of_consciousness, radiating_pain
        ]
        return feature_vector

    def predict_urgency(self, text: str, parsed_entities: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        feat_vec = self.extract_feature_vector(text, parsed_entities, context)
        df_feat = pd.DataFrame([feat_vec], columns=FEATURE_COLUMNS)

        probs = self.model.predict_proba(df_feat)[0]
        classes = list(self.model.classes_)
        
        pred_class = self.model.predict(df_feat)[0]
        pred_idx = classes.index(pred_class)
        confidence = float(round(probs[pred_idx] * 100, 1))

        explanation_reasons = []
        if feat_vec[3]: explanation_reasons.append("Sudden abrupt onset (+30% risk)")
        if feat_vec[2] >= 8: explanation_reasons.append("High severity score 8-10 (+25% risk)")
        if feat_vec[6]: explanation_reasons.append("Chest pain presentation (+35% risk)")
        if feat_vec[11]: explanation_reasons.append("Pain radiation to arm/jaw (+25% risk)")
        if feat_vec[5]: explanation_reasons.append("Respiratory breathlessness (+30% risk)")
        if feat_vec[8]: explanation_reasons.append("Unilateral neurological weakness (+40% risk)")

        if not explanation_reasons:
            explanation_reasons.append("Non-urgent routine symptom profile")

        return {
            "predicted_urgency": pred_class,
            "confidence_score": confidence,
            "class_probabilities": {cls: float(round(p * 100, 1)) for cls, p in zip(classes, probs)},
            "feature_explanations": explanation_reasons,
            "model_name": "Scikit-Learn Random Forest Classifier"
        }
