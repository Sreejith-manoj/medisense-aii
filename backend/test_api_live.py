import urllib.request
import json

def test_live_api():
    base_url = "http://127.0.0.1:8000"

    # 1. Test Symptom Analysis (Incomplete -> Follow-up)
    req_data = json.dumps({"text": "I have a headache"}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/api/analyze-symptoms", data=req_data, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    print("[1/3] Analyze Symptoms response:")
    print("  Extracted Symptoms:", data.get("parsed_entities", {}).get("extracted_symptoms"))
    print("  Is Complete:", data.get("parsed_entities", {}).get("is_complete"))
    print("  Adaptive Questions count:", len(data.get("adaptive_questions", [])))

    # 2. Test RAG Synthesize (Migraine scenario)
    rag_payload = json.dumps({
        "initial_text": "I have a throbbing headache with light sensitivity and nausea",
        "context": {"severity": "Moderate (4-6)", "duration": "1 - 3 days"}
    }).encode('utf-8')
    req2 = urllib.request.Request(f"{base_url}/api/synthesize-rag", data=rag_payload, headers={'Content-Type': 'application/json'})
    res2 = urllib.request.urlopen(req2)
    rag_data = json.loads(res2.read().decode())
    print("\n[2/3] Grounded RAG Synthesis response:")
    print("  Urgency Level:", rag_data["risk_assessment"]["urgency_level"])
    print("  Matched Condition:", rag_data["rag_synthesis"]["primary_condition"])
    print("  Retrieved Sources:", [s["title"] for s in rag_data["rag_synthesis"]["sources"]])

    # 3. Test Emergency Cardiac Red Flag
    cardiac_payload = json.dumps({
        "initial_text": "Sudden severe chest pain radiating to left arm and sweating",
        "context": {"severity": "Extreme / Unbearable (9-10)"}
    }).encode('utf-8')
    req3 = urllib.request.Request(f"{base_url}/api/synthesize-rag", data=cardiac_payload, headers={'Content-Type': 'application/json'})
    res3 = urllib.request.urlopen(req3)
    cardiac_data = json.loads(res3.read().decode())
    print("\n[3/3] Emergency Red Flag assessment:")
    print("  Urgency Level:", cardiac_data["risk_assessment"]["urgency_level"])
    print("  Badge:", cardiac_data["risk_assessment"]["badge_text"])

if __name__ == "__main__":
    test_live_api()
