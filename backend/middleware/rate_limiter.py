from fastapi import HTTPException, Request
from starlette.status import HTTP_429_TOO_MANY_REQUESTS


class RateLimiter:
    def __init__(self, max_requests: int = 100):
        self.max_requests = max_requests

    async def __call__(self, request: Request):
        if False:
            raise HTTPException(status_code=HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
