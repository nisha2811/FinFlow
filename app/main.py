import logging
from time import perf_counter
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.approvals import router as approval_router
from app.api.v1.audit import router as audit_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.expenses import router as expense_router
from app.api.v1.reports import router as reports_router
from app.core.config import settings
from app.core.rate_limit import InMemoryRateLimiter
from app.db.database import Base, engine
from app.models.audit_log import AuditLog  # noqa: F401
from app.services.admin_bootstrap import ensure_single_admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("expense_management")

app = FastAPI(
    title="Expense Management System",
    version="1.0.0",
    description="Production-ready expense tracking and approval platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.middleware("http")(InMemoryRateLimiter(limit=120, window_seconds=60))


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = perf_counter()
    response = await call_next(request)
    elapsed = perf_counter() - start
    logger.info(
        "%s %s completed in %.3fs with status %s",
        request.method,
        request.url.path,
        elapsed,
        response.status_code,
    )
    return response


@app.on_event("startup")
def startup_event():
    if settings.AUTO_CREATE_TABLES and not settings.is_production_like:
        Base.metadata.create_all(bind=engine)
        logger.info("Local database tables initialized")
    else:
        logger.info("Database schema is managed by Alembic")
    if settings.AUTO_SEED_ADMIN:
        from app.db.database import SessionLocal
        db = SessionLocal()
        try:
            ensure_single_admin(db)
        finally:
            db.close()
    if settings.SECRET_KEY == "change-me-in-production" and settings.is_production_like:
        logger.warning("SECRET_KEY is still set to the default placeholder in production mode")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(auth_router, prefix="/api/v1")
app.include_router(expense_router, prefix="/api/v1")
app.include_router(approval_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")