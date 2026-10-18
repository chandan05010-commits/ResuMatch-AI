from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./resumatch.db"

    # JWT
    jwt_secret: str = "dev-secret-key-change-in-production-min-32-characters-long"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    # URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    api_url: str = "http://localhost:8001"

    # File Upload
    max_upload_size_mb: int = 10
    upload_dir: str = "./uploads"

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Rate Limiting
    rate_limit_login: int = 5
    rate_limit_register: int = 3
    rate_limit_upload: int = 10
    rate_limit_analyze: int = 20

    # Password Reset / Email OTP
    password_reset_otp_expire_minutes: int = 4
    password_reset_otp_length: int = 6
    password_reset_max_attempts: int = 5
    password_reset_rate_limit_minutes: int = 1

    # SMTP / Email
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "ResuMatch AI"
    smtp_use_tls: bool = True

    # Logging
    log_level: str = "INFO"

    # AI
    gemini_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()