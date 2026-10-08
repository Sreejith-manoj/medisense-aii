"""
MediSense AI - FastAPI Server Router & API Endpoints
Serves Web App directly on / and provides endpoints for NLP, ML Engine, RAG Retrieval, Performance Metrics, and Simulation Tests.
"""

import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

# Import sub-modules
sys.path.insert(0, os.path.dirname(__file__))

from nlp.nlp_engine import NLPEngine
from ml.predictor import MLPredictor
from ml.trainer import train_and_evaluate
from rag.rag_engine import RAGEngine
from risk.risk_engine import RiskEngine
from tests.test_suite import run_test_suite

app = FastAPI(
    title="MediSense AI API Engine",
    description="Human-Centered Symptom Intelligence & Medical Information Assistant",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core AI Subsystems
nlp_engine = NLPEngine()
ml_predictor = MLPredictor()
rag_engine = RAGEngine()
risk_engine = RiskEngine()

class SymptomAnalysisRequest(BaseModel):
    text: str
    user_context: Optional[Dict[str, Any]] = None

class RAGSynthesizeRequest(BaseModel):
    initial_text: str
    context: Dict[str, Any]

class DoctorReportRequest(BaseModel):
    initial_text: str
    extracted_symptoms: List[str]
    context: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    ml_prediction: Dict[str, Any]
    rag_synthesis: Dict[str, Any]
    patient_info: Optional[Dict[str, Any]] = None

@app.get("/", response_class=HTMLResponse)
def serve_root():
    web_app_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "web_app.html")
    if os.path.exists(web_app_path):
        with open(web_app_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>MediSense AI Running</h1><p>Visit <a href='/api/health'>/api/health</a></p>")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "MediSense AI – Human-Centered Symptom Intelligence",
        "version": "3.0.0",
        "pipeline": [
            "01 PATIENT INTAKE", "02 NLP ENTITY EXTRACTION", "03 CLINICAL CONTEXT ADAPTATION",
            "04 ML CLASSIFIER", "05 EMERGENCY SAFETY SCREEN", "06 VECTOR RAG RETRIEVAL",
            "07 EXPLAINABLE AI RESPONSE", "08 CLINICAL CONSULTATION REPORT"
        ]
    }

@app.post("/api/analyze-symptoms")
def analyze_symptoms(req: SymptomAnalysisRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Symptom text is required.")

    # 1. NLP Entity Parsing
    parsed_entities = nlp_engine.parse_symptom_entities(req.text)
    
    # 2. Select Adaptive Questions with Clinical Rationale ("Why am I asking?")
    adaptive_questions = nlp_engine.select_adaptive_questions(parsed_entities, req.user_context)

    # 3. Early Safety & Risk Screen
    early_risk = risk_engine.evaluate_risk(req.text, req.user_context)

    # 4. Pipeline Visualization Nodes
    pipeline_stages = [
        {"id": "01", "name": "Patient Intake", "status": "completed", "detail": f"Parsed {len(req.text)} chars"},
        {"id": "02", "name": "NLP Processing", "status": "completed", "detail": f"Category: {parsed_entities['primary_category']}"},
        {"id": "03", "name": "Entity Extraction", "status": "completed", "detail": f"Entities: {', '.join(parsed_entities['extracted_symptoms']) or 'General'}"},
        {"id": "04", "name": "Context Adaptation", "status": "completed" if parsed_entities["is_complete"] else "active", "detail": f"{parsed_entities['completeness_score']}% Complete"},
        {"id": "05", "name": "Clinical Questions", "status": "active" if adaptive_questions else "completed", "detail": f"{len(adaptive_questions)} Questions"},
        {"id": "06", "name": "ML Classification", "status": "pending", "detail": "Awaiting final context"},
        {"id": "07", "name": "Vector RAG", "status": "pending", "detail": "Awaiting retrieval"},
        {"id": "08", "name": "Clinical Report", "status": "pending", "detail": "Pending"}
    ]

    return {
        "text": req.text,
        "parsed_entities": parsed_entities,
        "adaptive_questions": adaptive_questions,
        "early_risk": early_risk,
        "pipeline_stages": pipeline_stages
    }

@app.post("/api/synthesize-rag")
def synthesize_rag(req: RAGSynthesizeRequest):
    if not req.initial_text:
        raise HTTPException(status_code=400, detail="Initial text required.")

    # 1. NLP Parsing & Query Build
    parsed_entities = nlp_engine.parse_symptom_entities(req.initial_text)
    structured_query = nlp_engine.build_structured_query(req.initial_text, req.context)

    # 2. ML Urgency Classification & Feature Attribution Explainability
    ml_prediction = ml_predictor.predict_urgency(req.initial_text, parsed_entities, req.context)

    # 3. Safety Screening
    risk_assessment = risk_engine.evaluate_risk(req.initial_text, req.context)
    if risk_assessment["urgency_level"] == "EMERGENCY":
        ml_prediction["predicted_urgency"] = "EMERGENCY"

    # 4. Vector RAG Search & Evidence Ranking
    retrieved_passages = rag_engine.retrieve(structured_query, top_k=3)
    synthesis = rag_engine.synthesize_response(structured_query, retrieved_passages, risk_assessment)

    # 5. Chart Data
    chart_similarity_data = [
        {"title": p["title"], "score": p["similarity_pct"], "source": p["source"], "category": p["category"]}
        for p in retrieved_passages
    ]

    pipeline_stages = [
        {"id": "01", "name": "Patient Intake", "status": "completed", "detail": "Input received"},
        {"id": "02", "name": "NLP Processing", "status": "completed", "detail": "Entities parsed"},
        {"id": "03", "name": "Context Verification", "status": "completed", "detail": "Context verified"},
        {"id": "04", "name": "ML Classification", "status": "completed", "detail": f"Class: {ml_prediction['predicted_urgency']}"},
        {"id": "05", "name": "Safety Screen", "status": "completed", "detail": f"Screen: {risk_assessment['urgency_level']}"},
        {"id": "06", "name": "Vector RAG Search", "status": "completed", "detail": f"Matched {len(retrieved_passages)} passages"},
        {"id": "07", "name": "Evidence Ranking", "status": "completed", "detail": f"Top Match: {retrieved_passages[0]['title'] if retrieved_passages else 'None'}"},
        {"id": "08", "name": "Clinical Report", "status": "completed", "detail": "Report generated"}
    ]

    return {
        "structured_query": structured_query,
        "parsed_entities": parsed_entities,
        "ml_prediction": ml_prediction,
        "risk_assessment": risk_assessment,
        "retrieved_passages": retrieved_passages,
        "rag_synthesis": synthesis,
        "chart_similarity_data": chart_similarity_data,
        "pipeline_stages": pipeline_stages
    }

@app.get("/api/model-performance")
def get_model_performance():
    return ml_predictor.metrics

@app.get("/api/simulation-tests")
def get_simulation_tests():
    return run_test_suite()

@app.get("/api/knowledge-base")
def get_knowledge_base():
    return {
        "total_documents": len(rag_engine.knowledge_base),
        "documents": rag_engine.knowledge_base
    }

@app.post("/api/generate-doctor-report")
def generate_doctor_report(req: DoctorReportRequest):
    patient_data = req.patient_info or {
        "full_name": "Patient Consultation",
        "age": "N/A",
        "gender": "N/A",
        "blood_group": "N/A",
        "medical_history": "None Specified"
    }

    report = {
        "report_id": f"MEDISENSE-{hash(req.initial_text) & 0xffff:04X}",
        "date_generated": "October 2026",
        "title": "MediSense AI – Clinical Consultation & Symptom Intelligence Summary",
        "patient_details": patient_data,
        "chief_complaint": req.initial_text,
        "identified_symptom_entities": req.extracted_symptoms,
        "clinical_context": req.context,
        "ml_predicted_urgency": req.ml_prediction.get("predicted_urgency", "UNKNOWN"),
        "ml_confidence": req.ml_prediction.get("confidence_score", 0),
        "ml_feature_explanations": req.ml_prediction.get("feature_explanations", []),
        "risk_classification": req.risk_assessment.get("urgency_level", "UNKNOWN"),
        "risk_reasons": req.risk_assessment.get("reasons", []),
        "matched_topics": req.rag_synthesis.get("possible_considerations", []),
        "reference_citations": [s["title"] + " (" + s["source_name"] + ")" for s in req.rag_synthesis.get("sources", [])],
        "home_care_considerations": req.rag_synthesis.get("home_self_care", []),
        "disclaimer": "MediSense AI is an educational clinical decision-support model. This consultation report is generated for user health literacy reference and does NOT replace professional medical diagnosis."
    }
    return report

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
