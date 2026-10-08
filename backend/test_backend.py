"""
Unit Test Suite for Symptom Assistant Backend
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from nlp_engine import NLPEngine
from risk_engine import RiskEngine
from rag_engine import RAGEngine

def test_nlp_extraction():
    nlp = NLPEngine()
    res = nlp.extract_symptoms("I have severe chest pain and light sensitivity")
    assert "chest_pain" in res
    assert "light_sensitivity" in res
    print("[PASS] test_nlp_extraction passed")

def test_context_completeness():
    nlp = NLPEngine()
    res = nlp.analyze_context_completeness("Headache")
    assert res["is_complete"] is False
    assert len(res["follow_up_questions"]) > 0
    print("[PASS] test_context_completeness passed")

def test_risk_emergency():
    risk = RiskEngine()
    res = risk.evaluate_risk("Sudden severe chest pain radiating to my left arm")
    assert res["urgency_level"] == "EMERGENCY"
    assert res["color"] == "red"
    print("[PASS] test_risk_emergency passed")

def test_rag_retrieval():
    rag = RAGEngine()
    matches = rag.retrieve("migraine headache throbbing photophobia")
    assert len(matches) > 0
    assert matches[0]["id"] == "KB001"
    assert matches[0]["similarity_score"] > 0.1
    print("[PASS] test_rag_retrieval passed")

if __name__ == "__main__":
    test_nlp_extraction()
    test_context_completeness()
    test_risk_emergency()
    test_rag_retrieval()
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")
