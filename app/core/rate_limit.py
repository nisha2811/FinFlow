from collections import defaultdict, deque
from threading import Lock
from time import monotonic
from fastapi import HTTPException, Request

class InMemoryRateLimiter:
    """Small single-process limiter for local deployments.

    For multiple cloud instances, replace this storage with Redis or an API gateway limiter.
    """

    def __init__(self, limit: int = 120, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)
        self.lock = Lock()

    async def __call__(self, request: Request, call_next):
        client = request.client.host if request.client else "unknown"
        now = monotonic()
        with self.lock:
            timestamps = self.requests[client]
            while timestamps and now - timestamps[0] >= self.window_seconds:
                timestamps.popleft()
            if len(timestamps) >= self.limit:
                raise HTTPException(status_code=429, detail="Too many requests")
            timestamps.append(now)
        return await call_next(request)