from fastapi import FastAPI 
from .storage.database import init_db, engine
from .models.project import Project
from .services.scanner import scan_repository
from .services.git_analyzer import analyze_git_history
from sqlmodel import Session, select
from .scoring.hotspot import calculate_hotspots

from .services.settings_service import (
    save_github_token, save_gemini_key, is_setup_complete
)

from .services.settings_service import (
    save_github_token, save_gemini_key, is_setup_complete,
    validate_github_token, validate_gemini_key,
)

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Project Autopsy", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def health_check():
    return {"status": "ok", "app": "Project Autopsy backend running"}


@app.post("/api/projects/scan")
def scan_project(path: str, zone: str = "autopsy"):
    scan_result = scan_repository(path)

    with Session(engine) as session:
        existing = session.exec(
            select(Project).where(Project.path == path, Project.zone == zone)
        ).first()

        if existing:
            project = existing
        else:
            project = Project(
                name=path.split("\\")[-1].split("/")[-1],
                path=path,
                zone=zone,
            )
            session.add(project)
            session.commit()
            session.refresh(project)

    return {
        "project_id": project.id,
        "name": project.name,
        **scan_result,
    }


@app.get("/api/projects/git-history")
def git_history(path: str):
    return analyze_git_history(path)


@app.get("/api/projects/hotspots")
def hotspots(path: str):
    git_data = analyze_git_history(path)
    if not git_data.get("has_git_history"):
        return {"error": "No git history found"}

    return {
        "hotspots": calculate_hotspots(path, git_data["most_changed_files"])
    }


@app.get("/api/setup/status")
def setup_status():
    return {"setup_complete": is_setup_complete()}


@app.post("/api/setup/github-token")
def set_github_token(token: str):
    save_github_token(token)
    return {"status": "saved"}


@app.post("/api/setup/gemini-key")
def set_gemini_key(key: str):
    save_gemini_key(key)
    return {"status": "saved"}


@app.post("/api/setup/test-github-token")
def test_github_token(token: str):
    return {"valid": validate_github_token(token)}


@app.post("/api/setup/test-gemini-key")
def test_gemini_key(key: str):
    return {"valid": validate_gemini_key(key)}


@app.get("/api/projects")
def list_projects(zone: str = "autopsy"):
    with Session(engine) as session:
        projects = session.exec(
            select(Project)
            .where(Project.zone == zone)
            .order_by(Project.created_at.desc())
        ).all()
        return [
            {"id": p.id, "name": p.name, "path": p.path, "created_at": p.created_at.isoformat()}
            for p in projects
        ]