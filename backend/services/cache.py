import os
from dotenv import load_dotenv

load_dotenv()
REDIS_URL = os.getenv("REDIS_URL")

cache_client = None
if REDIS_URL:
    try:
        import redis
        cache_client = redis.from_url(REDIS_URL, decode_responses=True)
    except ImportError:
        cache_client = None


def get_cache(key: str) -> str | None:
    if not cache_client:
        return None
    return cache_client.get(key)


def set_cache(key: str, value: str, ttl: int = 300) -> None:
    if not cache_client:
        return
    cache_client.set(key, value, ex=ttl)
