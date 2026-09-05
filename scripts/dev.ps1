# Activates the env (if not already) and starts the backend with hot reload
conda activate autopsy-env
uvicorn backend.app.main:app --reload --port 8000