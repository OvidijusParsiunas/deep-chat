"""
Google Vertex Search Provider
Implements lazy loading - imports Google SDK only when methods are called
"""
from typing import List, Dict, Any, Optional
from backend.services.interfaces.search_base import SearchServiceInterface, SearchResult
import json


class GoogleVertexSearchService(SearchServiceInterface):
    """
    Google Vertex Search implementation with lazy loading

    CRITICAL: No imports at module level!
    All Google SDK imports happen inside methods (_get_client)
    """

    def __init__(
        self,
        project_id: str,
        location: str,
        data_store_id: str,
        credentials_json: str = ""
    ):
        self.project_id = project_id
        self.location = location
        self.data_store_id = data_store_id
        self.credentials_json = credentials_json
        self._client = None  # Lazy initialization
        self._initialized = False

    def _get_client(self):
        """
        Lazy import and client initialization
        Only imports Google SDK when first needed
        """
        if not self._initialized:
            # LAZY IMPORT
            from google.cloud import discoveryengine_v1alpha
            from google.oauth2 import service_account

            # Initialize credentials if provided
            if self.credentials_json:
                credentials_dict = json.loads(self.credentials_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict
                )
                self._client = discoveryengine_v1alpha.SearchServiceClient(
                    credentials=credentials
                )
            else:
                # Use default credentials (ADC)
                self._client = discoveryengine_v1alpha.SearchServiceClient()

            self._initialized = True

        return self._client

    def _get_serving_config(self) -> str:
        """Get the serving config path for search"""
        return f"projects/{self.project_id}/locations/{self.location}/collections/default_collection/dataStores/{self.data_store_id}/servingConfigs/default_config"

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Perform semantic search using Google Vertex Search"""
        try:
            client = self._get_client()

            # LAZY IMPORT
            from google.cloud import discoveryengine_v1alpha

            # Prepare search request
            request = discoveryengine_v1alpha.SearchRequest(
                serving_config=self._get_serving_config(),
                query=query,
                page_size=top_k
            )

            # Add filter if provided
            if filters:
                filter_str = self._build_filter_string(filters)
                request.filter = filter_str

            # Perform search
            response = client.search(request)

            # Convert to SearchResult objects
            search_results = []
            for result in response.results:
                document = result.document

                # Extract content from document
                content = ""
                if hasattr(document, 'derived_struct_data'):
                    struct_data = document.derived_struct_data
                    if 'snippets' in struct_data:
                        content = " ".join([s['snippet'] for s in struct_data['snippets']])
                    elif 'extractive_answers' in struct_data:
                        content = struct_data['extractive_answers'][0]['content']

                search_results.append(SearchResult(
                    content=content,
                    score=getattr(result, 'relevance_score', 1.0),
                    metadata={
                        "document_id": document.id,
                        "name": document.name
                    },
                    document_id=document.id
                ))

            return search_results

        except Exception as e:
            raise Exception(f"Google Vertex Search error: {str(e)}")

    def _build_filter_string(self, filters: Dict[str, Any]) -> str:
        """Build filter string for Google Vertex Search"""
        filter_parts = []
        for key, value in filters.items():
            if isinstance(value, str):
                filter_parts.append(f'{key}="{value}"')
            else:
                filter_parts.append(f'{key}={value}')
        return " AND ".join(filter_parts)

    async def index_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Index a single document"""
        try:
            # LAZY IMPORT
            from google.cloud import discoveryengine_v1alpha
            from google.oauth2 import service_account

            # Initialize document service client
            if self.credentials_json:
                credentials_dict = json.loads(self.credentials_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict
                )
                doc_client = discoveryengine_v1alpha.DocumentServiceClient(
                    credentials=credentials
                )
            else:
                doc_client = discoveryengine_v1alpha.DocumentServiceClient()

            # Prepare document
            parent = f"projects/{self.project_id}/locations/{self.location}/collections/default_collection/dataStores/{self.data_store_id}/branches/default_branch"

            document = discoveryengine_v1alpha.Document(
                id=document_id,
                content=discoveryengine_v1alpha.Document.Content(
                    raw_bytes=content.encode('utf-8'),
                    mime_type="text/plain"
                ),
                struct_data=metadata or {}
            )

            # Import document
            request = discoveryengine_v1alpha.CreateDocumentRequest(
                parent=parent,
                document=document,
                document_id=document_id
            )

            response = doc_client.create_document(request)

            return {
                "status": "success",
                "document_id": document_id,
                "message": "Document indexed successfully"
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
            succeeded = 0
            failed = 0
            errors = []

            # Index documents one by one (Vertex Search doesn't have true batch API)
            for doc in documents:
                result = await self.index_document(
                    doc["document_id"],
                    doc["content"],
                    doc.get("metadata")
                )

                if result["status"] == "success":
                    succeeded += 1
                else:
                    failed += 1
                    errors.append(result["message"])

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
            # LAZY IMPORT
            from google.cloud import discoveryengine_v1alpha
            from google.oauth2 import service_account

            # Initialize document service client
            if self.credentials_json:
                credentials_dict = json.loads(self.credentials_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict
                )
                doc_client = discoveryengine_v1alpha.DocumentServiceClient(
                    credentials=credentials
                )
            else:
                doc_client = discoveryengine_v1alpha.DocumentServiceClient()

            # Delete document
            name = f"projects/{self.project_id}/locations/{self.location}/collections/default_collection/dataStores/{self.data_store_id}/branches/default_branch/documents/{document_id}"

            request = discoveryengine_v1alpha.DeleteDocumentRequest(name=name)
            doc_client.delete_document(request)

            return {
                "status": "success",
                "message": f"Document {document_id} deleted successfully"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Delete error: {str(e)}"
            }

    async def test_connection(self) -> Dict[str, Any]:
        """Test Google Vertex Search connection"""
        try:
            client = self._get_client()

            # LAZY IMPORT
            from google.cloud import discoveryengine_v1alpha

            # Try a simple search to test connection
            request = discoveryengine_v1alpha.SearchRequest(
                serving_config=self._get_serving_config(),
                query="test",
                page_size=1
            )

            response = client.search(request)

            return {
                "status": "success",
                "message": "Successfully connected to Google Vertex Search",
                "details": {
                    "project_id": self.project_id,
                    "location": self.location,
                    "data_store_id": self.data_store_id
                }
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to Google Vertex Search: {str(e)}",
                "error": str(e)
            }

    async def get_document_count(self) -> int:
        """Get total number of indexed documents"""
        try:
            # This is approximate - Vertex Search doesn't provide exact count easily
            client = self._get_client()

            # LAZY IMPORT
            from google.cloud import discoveryengine_v1alpha

            request = discoveryengine_v1alpha.SearchRequest(
                serving_config=self._get_serving_config(),
                query="*",
                page_size=1
            )

            response = client.search(request)

            # Return approximate count
            return getattr(response, 'total_size', 0)

        except Exception:
            return 0
