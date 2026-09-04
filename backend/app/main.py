from fastapi import FastAPI

app = FastAPI(title="Project Autopsy", version="0.1.0")


@app.get("/")
def health_check():
    return {"status": "ok", "app": "Project Autopsy backend running"}