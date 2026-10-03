from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    gemini_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()