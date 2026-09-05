# Starts backend and frontend together, each in its own window

conda activate autopsy-env

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; conda activate autopsy-env; uvicorn backend.app.main:app --reload --port 8000"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; npm run dev"

Write-Host "Backend starting on http://127.0.0.1:8000"
Write-Host "Frontend starting on http://localhost:5173"