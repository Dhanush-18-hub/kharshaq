import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "karshaq-super-secret-key-12345")
    
    # Database configuration with fallback to SQLite
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        pg_user = os.getenv("DB_USER")
        pg_password = os.getenv("DB_PASSWORD")
        pg_host = os.getenv("DB_HOST", "localhost")
        pg_port = os.getenv("DB_PORT", "5432")
        pg_name = os.getenv("DB_NAME", "karshaq")
        if pg_user and pg_password:
            DATABASE_URL = f"postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_name}"
        else:
            # Fallback to local SQLite DB in workspace root
            db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'karshaq.db'))
            db_path = db_path.replace('\\', '/')
            DATABASE_URL = f"sqlite:///{db_path}"
            
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-karshaq-56789")
    # Remember me will be implemented by generating token with longer/infinite expiry or handling it client-side
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    
    # OTP Configuration
    OTP_EXPIRY_MINUTES = 5
    OTP_RESEND_SECONDS = 30
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
