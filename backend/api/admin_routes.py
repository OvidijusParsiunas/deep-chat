"""
Admin routes for DGA Qiyas Copilot
Handles settings management and provider connection testing
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.core.config import get_settings, update_settings, reload_settings
from backend.core.factory import test_provider_connection
from backend.api.auth_routes import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


class SettingsUpdateRequest(BaseModel):
    """Request model for updating settings"""
    llm: Optional[Dict[str, Any]] = None
    search: Optional[Dict[str, Any]] = None
    storage: Optional[Dict[str, Any]] = None
    auth: Optional[Dict[str, Any]] = None
    server: Optional[Dict[str, Any]] = None


class TestConnectionRequest(BaseModel):
    """Request model for testing provider connection"""
    service_type: str  # "llm", "search", or "storage"
    provider: str  # "azure" or "google"
    config: Dict[str, Any]  # Provider-specific configuration


def require_admin(current_user: User = Depends(get_current_user)):
    """
    Dependency to require admin privileges

    Args:
        current_user: Current authenticated user

    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


@router.get("/settings")
async def get_current_settings():
    """
    Get current application settings

    Note: Sensitive fields (API keys, credentials) are masked
    """
    settings = get_settings()

    # Convert to dict and mask sensitive fields
    settings_dict = settings.model_dump()

    # Mask sensitive fields
    def mask_sensitive(obj, parent_key=""):
        if isinstance(obj, dict):
            for key, value in obj.items():
                full_key = f"{parent_key}.{key}" if parent_key else key
                if key in ["api_key", "connection_string", "credentials_json", "jwt_secret", "bind_password", "password"]:
                    if value:
                        obj[key] = "***MASKED***"
                elif isinstance(value, dict):
                    mask_sensitive(value, full_key)
        return obj

    masked_settings = mask_sensitive(settings_dict)

    return {
        "status": "success",
        "settings": masked_settings
    }


@router.post("/settings")
async def update_application_settings(
    request: SettingsUpdateRequest,
    admin_user: User = Depends(require_admin)
):
    """
    Update application settings

    Only admin users can update settings.
    Settings are persisted to config/settings.yaml
    """
    try:
        # Prepare updates dict
        updates = {}

        if request.llm is not None:
            updates["llm"] = request.llm

        if request.search is not None:
            updates["search"] = request.search

        if request.storage is not None:
            updates["storage"] = request.storage

        if request.auth is not None:
            updates["auth"] = request.auth

        if request.server is not None:
            updates["server"] = request.server

        # Update settings
        new_settings = update_settings(updates)

        return {
            "status": "success",
            "message": "Settings updated successfully",
            "updated_by": admin_user.username
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.post("/test-connection")
async def test_connection(
    request: TestConnectionRequest,
    admin_user: User = Depends(require_admin)
):
    """
    Test provider connection without saving configuration

    This allows admins to verify credentials before saving to settings.
    Supports testing LLM, Search, and Storage providers.

    Example request:
    {
        "service_type": "storage",
        "provider": "azure",
        "config": {
            "connection_string": "...",
            "container_name": "test"
        }
    }
    """
    try:
        # Validate service type
        if request.service_type not in ["llm", "search", "storage"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid service_type: {request.service_type}. Must be 'llm', 'search', or 'storage'"
            )

        # Validate provider
        if request.provider not in ["azure", "google"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid provider: {request.provider}. Must be 'azure' or 'google'"
            )

        # Test connection using factory
        result = test_provider_connection(
            service_type=request.service_type,
            provider=request.provider,
            config=request.config
        )

        return {
            **result,
            "tested_by": admin_user.username
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection test failed: {str(e)}",
            "error": str(e)
        }


@router.post("/reload-settings")
async def reload_application_settings(admin_user: User = Depends(require_admin)):
    """
    Reload settings from config/settings.yaml

    Useful after manually editing the settings file
    """
    try:
        reload_settings()

        return {
            "status": "success",
            "message": "Settings reloaded successfully",
            "reloaded_by": admin_user.username
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload settings: {str(e)}"
        )


@router.get("/provider-status")
async def get_provider_status():
    """
    Get status of all configured providers

    Returns which providers are currently configured and active
    """
    settings = get_settings()

    status_info = {
        "llm": {
            "active_provider": settings.llm.active_provider,
            "configured": settings.llm.active_provider is not None,
            "available_providers": ["azure", "google"]
        },
        "search": {
            "active_provider": settings.search.active_provider,
            "configured": settings.search.active_provider is not None,
            "available_providers": ["azure", "google"]
        },
        "storage": {
            "active_provider": settings.storage.active_provider,
            "configured": settings.storage.active_provider is not None,
            "available_providers": ["azure", "google"]
        }
    }

    # Check if in Setup Mode (no providers configured)
    setup_mode = (
        not status_info["llm"]["configured"] and
        not status_info["search"]["configured"] and
        not status_info["storage"]["configured"]
    )

    return {
        "status": "success",
        "setup_mode": setup_mode,
        "providers": status_info
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring

    Checks if the application is running and which providers are configured
    """
    settings = get_settings()

    return {
        "status": "healthy",
        "llm_provider": settings.llm.active_provider or "not_configured",
        "search_provider": settings.search.active_provider or "not_configured",
        "storage_provider": settings.storage.active_provider or "not_configured",
        "auth_ldap_enabled": settings.auth.ldap.enabled,
        "auth_local_enabled": settings.auth.local_db_fallback
    }
