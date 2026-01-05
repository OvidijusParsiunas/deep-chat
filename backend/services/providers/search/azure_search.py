"""
Azure AI Search Provider
Implements lazy loading - imports Azure SDK only when methods are called
"""
from typing import List, Dict, Any, Optional
from backend.services.interfaces.search_base import SearchServiceInterface, SearchResult


class AzureAISearchService(SearchServiceInterface):
    """
    Azure AI Search implementation with lazy loading

    CRITICAL: No imports at module level!
    All Azure SDK imports happen inside methods (_get_client)
    """

    def __init__(
        self,
        service_name: str,
        api_key: str,
        index_name: str,
        api_version: str = "2023-11-01"
    ):
        self.service_name = service_name
        self.api_key = api_key
        self.index_name = index_name
        self.api_version = api_version
        self.endpoint = f"https://{service_name}.search.windows.net"
        self._search_client = None  # Lazy initialization
        self._index_client = None  # Lazy initialization

    def _get_search_client(self):
        """
        Lazy import and search client initialization
        Only imports Azure SDK when first needed
        """
        if self._search_client is None:
            # LAZY IMPORT
            from azure.core.credentials import AzureKeyCredential
            from azure.search.documents import SearchClient

            self._search_client = SearchClient(
                endpoint=self.endpoint,
                index_name=self.index_name,
                credential=AzureKeyCredential(self.api_key)
            )
        return self._search_client

    def _get_index_client(self):
        """
        Lazy import and index client initialization
        """
        if self._index_client is None:
            # LAZY IMPORT
            from azure.core.credentials import AzureKeyCredential
            from azure.search.documents.indexes import SearchIndexClient

            self._index_client = SearchIndexClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.api_key)
            )
        return self._index_client

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Perform semantic search using Azure AI Search"""
        try:
            client = self._get_search_client()

            # Prepare search parameters
            search_params = {
                "search_text": query,
                "top": top_k,
                "include_total_count": True
            }

            # Add filters if provided
            if filters:
                filter_str = self._build_filter_string(filters)
                search_params["filter"] = filter_str

            # Perform search
            results = client.search(**search_params)

            # Convert to SearchResult objects
            search_results = []
            for result in results:
                search_results.append(SearchResult(
                    content=result.get("content", ""),
                    score=result.get("@search.score", 0.0),
                    metadata={
                        k: v for k, v in result.items()
                        if not k.startswith("@")
                    },
                    document_id=result.get("id")
                ))

            return search_results

        except Exception as e:
            raise Exception(f"Azure AI Search error: {str(e)}")

    def _build_filter_string(self, filters: Dict[str, Any]) -> str:
        """Build OData filter string from dict"""
        filter_parts = []
        for key, value in filters.items():
            if isinstance(value, str):
                filter_parts.append(f"{key} eq '{value}'")
            else:
                filter_parts.append(f"{key} eq {value}")
        return " and ".join(filter_parts)

    async def index_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Index a single document"""
        try:
            client = self._get_search_client()

            # Prepare document
            document = {
                "id": document_id,
                "content": content,
                **(metadata or {})
            }

            # Upload document
            result = client.upload_documents(documents=[document])

            if result[0].succeeded:
                return {
                    "status": "success",
                    "document_id": document_id,
                    "message": "Document indexed successfully"
                }
            else:
                return {
                    "status": "error",
                    "document_id": document_id,
                    "message": f"Indexing failed: {result[0].error_message}"
                }

        except Exception as e:
            return {
                "status": "error",
                "document_id": document_id,
                "message": f"Indexing error: {str(e)}"
            }

    async def index_documents_batch(
        self,
        documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Index multiple documents in batch"""
        try:
            client = self._get_search_client()

            # Prepare documents
            formatted_docs = []
            for doc in documents:
                formatted_docs.append({
                    "id": doc["document_id"],
                    "content": doc["content"],
                    **(doc.get("metadata", {}))
                })

            # Upload batch
            results = client.upload_documents(documents=formatted_docs)

            # Count successes and failures
            succeeded = sum(1 for r in results if r.succeeded)
            failed = len(results) - succeeded
            errors = [r.error_message for r in results if not r.succeeded]

            return {
                "status": "success" if failed == 0 else "partial",
                "indexed_count": succeeded,
                "failed_count": failed,
                "errors": errors
            }

        except Exception as e:
            return {
                "status": "error",
                "indexed_count": 0,
                "failed_count": len(documents),
                "errors": [str(e)]
            }

    async def delete_document(self, document_id: str) -> Dict[str, Any]:
        """Delete a document from the index"""
        try:
            client = self._get_search_client()

            result = client.delete_documents(documents=[{"id": document_id}])

            if result[0].succeeded:
                return {
                    "status": "success",
                    "message": f"Document {document_id} deleted successfully"
                }
            else:
                return {
                    "status": "error",
                    "message": f"Delete failed: {result[0].error_message}"
                }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Delete error: {str(e)}"
            }

    async def test_connection(self) -> Dict[str, Any]:
        """Test Azure AI Search connection"""
        try:
            index_client = self._get_index_client()

            # Try to get index statistics
            index = index_client.get_index(self.index_name)

            return {
                "status": "success",
                "message": "Successfully connected to Azure AI Search",
                "details": {
                    "service_name": self.service_name,
                    "index_name": self.index_name,
                    "index_exists": True,
                    "field_count": len(index.fields) if hasattr(index, 'fields') else 0
                }
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to Azure AI Search: {str(e)}",
                "error": str(e)
            }

    async def get_document_count(self) -> int:
        """Get total number of indexed documents"""
        try:
            client = self._get_search_client()

            # Search with empty query to get count
            results = client.search(
                search_text="*",
                include_total_count=True,
                top=0
            )

            return results.get_count()

        except Exception:
            return 0
