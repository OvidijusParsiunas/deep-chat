"""
Settings Manager for DGA Qiyas Copilot
Uses Pydantic for validation and YAML for configuration storage
"""
from pydantic import BaseModel, Field
from typing import Optional, List
import yaml
from pathlib import Path
from functools import lru_cache


class AzureLLMSettings(BaseModel):
    """Azure OpenAI configuration"""
    api_key: str = ""
    endpoint: str = ""
    deployment: str = ""
    api_version: str = "2024-02-15-preview"


class GoogleLLMSettings(BaseModel):
    """Google Vertex AI configuration"""
    project_id: str = ""
    location: str = ""
    model_name: str = "gemini-pro"
    credentials_json: str = ""


class LLMSettings(BaseModel):
    """LLM provider settings"""
    active_provider: Optional[str] = None
    azure: AzureLLMSettings = Field(default_factory=AzureLLMSettings)
    google: GoogleLLMSettings = Field(default_factory=GoogleLLMSettings)


class AzureSearchSettings(BaseModel):
    """Azure AI Search configuration"""
    service_name: str = ""
    api_key: str = ""
    index_name: str = ""
    api_version: str = "2023-11-01"


class GoogleSearchSettings(BaseModel):
    """Google Vertex Search configuration"""
    project_id: str = ""
    location: str = ""
    data_store_id: str = ""
    credentials_json: str = ""


class SearchSettings(BaseModel):
    """Search/RAG provider settings"""
    active_provider: Optional[str] = None
    azure: AzureSearchSettings = Field(default_factory=AzureSearchSettings)
    google: GoogleSearchSettings = Field(default_factory=GoogleSearchSettings)


class AzureStorageSettings(BaseModel):
    """Azure Blob Storage configuration"""
    connection_string: str = ""
    container_name: str = "qiyas-uploads"


class GoogleStorageSettings(BaseModel):
    """Google Cloud Storage configuration"""
    bucket_name: str = ""
    credentials_json: str = ""


class StorageSettings(BaseModel):
    """Storage provider settings"""
    active_provider: Optional[str] = None
    azure: AzureStorageSettings = Field(default_factory=AzureStorageSettings)
    google: GoogleStorageSettings = Field(default_factory=GoogleStorageSettings)


class LDAPSettings(BaseModel):
    """LDAP authentication configuration"""
    enabled: bool = False
    server: str = ""
    port: int = 389
    use_ssl: bool = False
    base_dn: str = ""
    user_dn_template: str = "uid={username},ou=users,dc=example,dc=com"
    bind_dn: str = ""
    bind_password: str = ""


class AuthSettings(BaseModel):
    """Authentication settings"""
    ldap: LDAPSettings = Field(default_factory=LDAPSettings)
    local_db_fallback: bool = True
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24


class ServerSettings(BaseModel):
    """Server configuration"""
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    cors_origins: List[str] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://localhost:8000"
    ])


class DatabaseSettings(BaseModel):
    """Database configuration"""
    url: str = "sqlite:///./data/qiyas.db"
    echo: bool = False


class Settings(BaseModel):
    """Main settings model"""
    llm: LLMSettings = Field(default_factory=LLMSettings)
    search: SearchSettings = Field(default_factory=SearchSettings)
    storage: StorageSettings = Field(default_factory=StorageSettings)
    auth: AuthSettings = Field(default_factory=AuthSettings)
    server: ServerSettings = Field(default_factory=ServerSettings)
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)


# Global settings cache
_settings_cache: Optional[Settings] = None


def get_config_path() -> Path:
    """Get the path to settings.yaml"""
    return Path(__file__).parent.parent.parent / "config" / "settings.yaml"


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings (singleton pattern)

    Returns:
        Settings: Application configuration
    """
    global _settings_cache

    if _settings_cache is None:
        config_path = get_config_path()

        if not config_path.exists():
            # Return default settings if config doesn't exist
            _settings_cache = Settings()
        else:
            with open(config_path, 'r') as f:
                config_data = yaml.safe_load(f) or {}
            _settings_cache = Settings(**config_data)

    return _settings_cache


def reload_settings() -> Settings:
    """
    Force reload settings from YAML file
    Called after admin updates configuration

    Returns:
        Settings: Reloaded configuration
    """
    global _settings_cache
    _settings_cache = None
    get_settings.cache_clear()
    return get_settings()


def save_settings(settings: Settings) -> None:
    """
    Save settings to YAML file

    Args:
        settings: Settings object to save
    """
    config_path = get_config_path()
    config_path.parent.mkdir(parents=True, exist_ok=True)

    # Convert Pydantic model to dict
    settings_dict = settings.model_dump()

    with open(config_path, 'w') as f:
        yaml.dump(settings_dict, f, default_flow_style=False, sort_keys=False)

    # Reload settings cache
    reload_settings()


def update_settings(updates: dict) -> Settings:
    """
    Update specific settings fields

    Args:
        updates: Dictionary with settings updates

    Returns:
        Settings: Updated settings
    """
    current_settings = get_settings()

    # Deep merge updates into current settings
    current_dict = current_settings.model_dump()
    merged_dict = deep_merge(current_dict, updates)

    # Validate and save
    new_settings = Settings(**merged_dict)
    save_settings(new_settings)

    return new_settings


def deep_merge(base: dict, updates: dict) -> dict:
    """
    Deep merge two dictionaries

    Args:
        base: Base dictionary
        updates: Dictionary with updates

    Returns:
        dict: Merged dictionary
    """
    result = base.copy()

    for key, value in updates.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value

    return result
