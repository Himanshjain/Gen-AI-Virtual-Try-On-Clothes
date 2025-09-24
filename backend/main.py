from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.tryon import router as tryon_router

app = FastAPI(
    title="Virtual Try-On API",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# Allow any origin during development; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the try-on router under /api
app.include_router(tryon_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
