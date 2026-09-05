from fastapi import FastAPI
from .storage.database import init_db
from .models.project import Project

app = FastAPI(title="Project Autopsy", version="0.1.0")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def health_check():
    return {"status": "ok", "app": "Project Autopsy backend running"}