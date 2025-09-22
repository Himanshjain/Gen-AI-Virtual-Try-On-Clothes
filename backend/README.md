# ai-virtual-try-on-clothes


In Git Bash or PowerShell:

cd "D:/Code/Clothes Try On/backend"
python -m venv .venv

Git Bash:
source .venv/Scripts/activate

PowerShell
.venv\Scripts\Activate.ps1

pip install fastapi uvicorn python-dotenv google-genai
python -m uvicorn main:app --reload --port 8080