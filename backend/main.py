"""
DGA Qiyas Copilot - FastAPI Main Entry Point

This is the main application file that:
1. Starts instantly (0.5s boot time) - NO cloud connections on startup
2. Initializes database
3. Registers API routes
4. Configures CORS
5. Serves frontend static files (if built)

All cloud provider connections are lazy-loaded via the factory pattern
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import logging

from backend.core.config import get_settings
from backend.core.database import init_db
from backend.api import auth_routes, admin_routes, chat_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="DGA Qiyas Copilot",
    description="Enterprise AI Platform with Multi-Cloud Provider Support",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)


@app.on_event("startup")
async def startup_event():
    """
    Application startup event

    CRITICAL: This MUST complete in < 0.5 seconds
    NO cloud connections are made here!
    """
    logger.info("🚀 DGA Qiyas Copilot starting...")

    try:
        # Initialize database (creates tables if needed)
        init_db()
        logger.info("✅ Database initialized")

        # Load settings (from YAML file - fast)
        settings = get_settings()
        logger.info("✅ Settings loaded")

        # Log provider status
        logger.info(f"📊 Provider Status:")
        logger.info(f"   - LLM: {settings.llm.active_provider or 'not configured'}")
        logger.info(f"   - Search: {settings.search.active_provider or 'not configured'}")
        logger.info(f"   - Storage: {settings.storage.active_provider or 'not configured'}")

        if not settings.llm.active_provider:
            logger.warning("⚠️  Setup Mode: No providers configured. Please configure via Settings UI.")

        logger.info("✅ DGA Qiyas Copilot started successfully!")

    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("👋 DGA Qiyas Copilot shutting down...")


# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(chat_routes.router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An internal error occurred",
            "detail": str(exc) if settings.server.reload else "Internal server error"
        }
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - returns API status"""
    settings = get_settings()

    # Check if in setup mode
    setup_mode = (
        not settings.llm.active_provider and
        not settings.search.active_provider and
        not settings.storage.active_provider
    )

    return {
        "name": "DGA Qiyas Copilot",
        "version": "1.0.0",
        "status": "running",
        "setup_mode": setup_mode,
        "providers": {
            "llm": settings.llm.active_provider or "not_configured",
            "search": settings.search.active_provider or "not_configured",
            "storage": settings.storage.active_provider or "not_configured"
        },
        "docs": "/api/docs"
    }


# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": "2026-01-05T00:00:00Z"
    }


# Serve frontend static files (if built)
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    # Mount static files
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """
        Serve frontend for all non-API routes
        This enables React Router to work properly
        """
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return JSONResponse(
                status_code=404,
                content={"detail": "Not found"}
            )

        # Check if file exists
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)

        # Serve index.html for all other routes (SPA routing)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

        return JSONResponse(
            status_code=404,
            content={"detail": "Frontend not found"}
        )
else:
    logger.warning("⚠️  Frontend dist folder not found. Run 'npm run build' in frontend directory.")


# Entry point for direct execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host=settings.server.host,
        port=settings.server.port,
        reload=settings.server.reload,
        log_level="info"
    )
