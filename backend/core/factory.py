"""
Master Factory for DGA Qiyas Copilot
Implements lazy loading pattern for LLM, Search, and Storage providers
All cloud SDK imports happen inside factory functions, not at module level
"""
from typing import Optional
from backend.core.config import get_settings
from backend.services.interfaces.llm_base import LLMServiceInterface
from backend.services.interfaces.search_base import SearchServiceInterface
from backend.services.interfaces.storage_base import StorageServiceInterface


def get_llm_service() -> Optional[LLMServiceInterface]:
    """
    Factory for LLM providers with lazy loading

    Returns:
        Optional[LLMServiceInterface]: LLM service instance, or None if not configured

    Design:
        - Imports provider classes inside if blocks (lazy loading)
        - Returns None if active_provider is null (Setup Mode)
        - No cloud SDKs imported at module level

    Example:
        llm = get_llm_service()
        if llm is None:
            return {"error": "LLM not configured. Please configure in Settings."}

        response = await llm.generate_response(messages)
    """
    settings = get_settings()
    provider = settings.llm.active_provider

    if provider == "azure":
        # Lazy import - only imported when Azure is selected
        from backend.services.providers.llm.azure_llm import AzureOpenAIService

        return AzureOpenAIService(
            api_key=settings.llm.azure.api_key,
            endpoint=settings.llm.azure.endpoint,
            deployment=settings.llm.azure.deployment,
            api_version=settings.llm.azure.api_version
        )

    elif provider == "google":
        # Lazy import - only imported when Google is selected
        from backend.services.providers.llm.google_llm import GoogleVertexAIService

        return GoogleVertexAIService(
            project_id=settings.llm.google.project_id,
            location=settings.llm.google.location,
            model_name=settings.llm.google.model_name,
            credentials_json=settings.llm.google.credentials_json
        )

    else:
        # Not configured - return None (Setup Mode)
        return None


def get_search_service() -> Optional[SearchServiceInterface]:
    """
    Factory for Search/RAG providers with lazy loading

    Returns:
        Optional[SearchServiceInterface]: Search service instance, or None if not configured

    Example:
        search = get_search_service()
        if search is None:
            # RAG disabled, proceed without search
            return await llm.generate_response(messages)

        # RAG enabled - enhance with search results
        results = await search.search(query)
        enhanced_context = build_context(results)
        return await llm.generate_response(enhanced_context + messages)
    """
    settings = get_settings()
    provider = settings.search.active_provider

    if provider == "azure":
        # Lazy import
        from backend.services.providers.search.azure_search import AzureAISearchService

        return AzureAISearchService(
            service_name=settings.search.azure.service_name,
            api_key=settings.search.azure.api_key,
            index_name=settings.search.azure.index_name,
            api_version=settings.search.azure.api_version
        )

    elif provider == "google":
        # Lazy import
        from backend.services.providers.search.google_search import GoogleVertexSearchService

        return GoogleVertexSearchService(
            project_id=settings.search.google.project_id,
            location=settings.search.google.location,
            data_store_id=settings.search.google.data_store_id,
            credentials_json=settings.search.google.credentials_json
        )

    else:
        # Not configured
        return None


def get_storage_service() -> Optional[StorageServiceInterface]:
    """
    Factory for Storage providers with lazy loading

    Returns:
        Optional[StorageServiceInterface]: Storage service instance, or None if not configured

    Example:
        storage = get_storage_service()
        if storage is None:
            # Fallback to local file system or in-memory
            save_file_locally(file_data, filename)
        else:
            # Use cloud storage
            uploaded = await storage.upload_file(file_data, filename)
            file_url = uploaded.url
    """
    settings = get_settings()
    provider = settings.storage.active_provider

    if provider == "azure":
        # Lazy import
        from backend.services.providers.storage.azure_storage import AzureBlobStorageService

        return AzureBlobStorageService(
            connection_string=settings.storage.azure.connection_string,
            container_name=settings.storage.azure.container_name
        )

    elif provider == "google":
        # Lazy import
        from backend.services.providers.storage.google_storage import GoogleCloudStorageService

        return GoogleCloudStorageService(
            bucket_name=settings.storage.google.bucket_name,
            credentials_json=settings.storage.google.credentials_json
        )

    else:
        # Not configured
        return None


def test_provider_connection(
    service_type: str,
    provider: str,
    config: dict
) -> dict:
    """
    Test a provider connection without saving configuration

    Args:
        service_type: "llm", "search", or "storage"
        provider: "azure" or "google"
        config: Provider-specific configuration dict

    Returns:
        dict: Test result with status, message, and details

    Example:
        result = test_provider_connection(
            "storage",
            "azure",
            {
                "connection_string": "...",
                "container_name": "test"
            }
        )

        if result["status"] == "success":
            print("Connection successful!")
        else:
            print(f"Error: {result['message']}")
    """
    import asyncio

    async def _test():
        try:
            if service_type == "llm":
                if provider == "azure":
                    from backend.services.providers.llm.azure_llm import AzureOpenAIService
                    service = AzureOpenAIService(**config)
                elif provider == "google":
                    from backend.services.providers.llm.google_llm import GoogleVertexAIService
                    service = GoogleVertexAIService(**config)
                else:
                    return {"status": "error", "message": f"Unknown provider: {provider}"}

            elif service_type == "search":
                if provider == "azure":
                    from backend.services.providers.search.azure_search import AzureAISearchService
                    service = AzureAISearchService(**config)
                elif provider == "google":
                    from backend.services.providers.search.google_search import GoogleVertexSearchService
                    service = GoogleVertexSearchService(**config)
                else:
                    return {"status": "error", "message": f"Unknown provider: {provider}"}

            elif service_type == "storage":
                if provider == "azure":
                    from backend.services.providers.storage.azure_storage import AzureBlobStorageService
                    service = AzureBlobStorageService(**config)
                elif provider == "google":
                    from backend.services.providers.storage.google_storage import GoogleCloudStorageService
                    service = GoogleCloudStorageService(**config)
                else:
                    return {"status": "error", "message": f"Unknown provider: {provider}"}

            else:
                return {"status": "error", "message": f"Unknown service type: {service_type}"}

            # Test the connection
            result = await service.test_connection()
            return result

        except Exception as e:
            return {
                "status": "error",
                "message": f"Connection test failed: {str(e)}",
                "error": str(e)
            }

    # Run async test
    return asyncio.run(_test())
