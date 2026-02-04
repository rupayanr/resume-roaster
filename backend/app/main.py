from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

# Clear cache to pick up fresh env values
get_settings.cache_clear()
settings = get_settings()

from app.api.routes import roast, auth, resumes

app = FastAPI(
    title="Resume Roaster API",
    description="Upload your resume, get brutally honest AI feedback",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roast.router, prefix="/api/v1", tags=["roast"])
app.include_router(auth.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
