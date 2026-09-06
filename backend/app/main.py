from fastapi import FastAPI
from sqlmodel import Session
from .storage.database import init_db, engine
from .models.project import Project
from .services.scanner import scan_repository
from .services.git_analyzer import analyze_git_history
from sqlmodel import Session, select

app = FastAPI(title="Project Autopsy", version="0.1.0")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def health_check():
    return {"status": "ok", "app": "Project Autopsy backend running"}


@app.post("/api/projects/scan")
def scan_project(path: str):
    scan_result = scan_repository(path)

    with Session(engine) as session:
        existing = session.exec(
            select(Project).where(Project.path == path)
        ).first()

        if existing:
            project = existing
        else:
            project = Project(name=path.split("\\")[-1].split("/")[-1], path=path)
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