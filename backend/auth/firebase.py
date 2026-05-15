import os
import json

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import auth, credentials

load_dotenv()

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")
FIREBASE_PRIVATE_KEY_ID = os.getenv("FIREBASE_PRIVATE_KEY_ID")
FIREBASE_CLIENT_ID = os.getenv("FIREBASE_CLIENT_ID")
FIREBASE_CLIENT_X509_CERT_URL = os.getenv("FIREBASE_CLIENT_X509_CERT_URL")

firebase_app = None

def _has_valid_firebase_config() -> bool:
    if not (FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY):
        return False
    if "your-firebase" in FIREBASE_PROJECT_ID or "your-firebase" in FIREBASE_CLIENT_EMAIL:
        return False
    if FIREBASE_PRIVATE_KEY.strip().endswith("..."):
        return False
    if "-----BEGIN PRIVATE KEY-----" not in FIREBASE_PRIVATE_KEY:
        return False
    return True

if _has_valid_firebase_config():
    try:
        private_key = FIREBASE_PRIVATE_KEY.replace('\\n', '\n')
        credentials_dict = {
            "type": "service_account",
            "project_id": FIREBASE_PROJECT_ID,
            "private_key_id": FIREBASE_PRIVATE_KEY_ID or "",
            "private_key": private_key,
            "client_email": FIREBASE_CLIENT_EMAIL,
            "client_id": FIREBASE_CLIENT_ID or "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": FIREBASE_CLIENT_X509_CERT_URL or "",
        }
        firebase_app = firebase_admin.initialize_app(credentials.Certificate(credentials_dict))
    except Exception:
        firebase_app = None


def verify_firebase_token(id_token: str) -> dict:
    if not firebase_app:
        raise RuntimeError("Firebase admin credentials are not configured")
    return auth.verify_id_token(id_token)
