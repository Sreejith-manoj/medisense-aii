"""
Unified Startup Script for AI-Based Symptom-to-Information Assistant
Launches FastAPI backend (Port 8000) and Vite React frontend (Port 3000).
"""

import os
import sys
import subprocess
import time
import urllib.request
import json

def check_backend_dependencies():
    print("[1/3] Checking Python backend dependencies...")
    try:
        import fastapi
        import uvicorn
        import pydantic
        print(" -> All Python backend dependencies installed.")
    except ImportError:
        print(" -> Installing missing dependencies from backend/requirements.txt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])

def check_frontend_dependencies():
    print("[2/3] Checking Frontend node_modules...")
    node_modules_path = os.path.join("frontend", "node_modules")
    if not os.path.exists(node_modules_path):
        print(" -> Installing frontend npm packages...")
        subprocess.check_call("npm install", cwd="frontend", shell=True)
    else:
        print(" -> Frontend dependencies ready.")

def launch_servers():
    print("[3/3] Launching Backend and Frontend Servers...")
    
    # 1. Start FastAPI Backend Process
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd="backend"
    )
    print(" -> FastAPI Backend started on http://127.0.0.1:8000")

    # 2. Start Vite Frontend Process
    frontend_proc = subprocess.Popen(
        "npm run dev",
        cwd="frontend",
        shell=True
    )
    print(" -> Vite Frontend dev server started on http://localhost:3000")

    print("\n=================================================================")
    print("  AI-BASED SYMPTOM-TO-INFORMATION ASSISTANT IS NOW RUNNING!")
    print("  Frontend UI: http://localhost:3000")
    print("  Backend API: http://127.0.0.1:8000")
    print("=================================================================\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    check_backend_dependencies()
    check_frontend_dependencies()
    launch_servers()
