"""
Abstract base class for Search/RAG service providers
Defines the interface for document indexing and semantic search
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class SearchResult:
    """Represents a single search result"""

    def __init__(
        self,
        content: str,
        score: float,
        metadata: Optional[Dict[str, Any]] = None,
        document_id: Optional[str] = None
    ):
        self.content = content
        self.score = score
        self.metadata = metadata or {}
        self.document_id = document_id

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "content": self.content,
            "score": self.score,
            "metadata": self.metadata,
            "document_id": self.document_id
        }


class SearchServiceInterface(ABC):
    """
    Abstract interface for Search/RAG providers
    Supports both Azure AI Search and Google Vertex Search
    """

    @abstractmethod
    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """
        Perform semantic search

        Args:
            query: Search query text
            top_k: Number of results to return
            filters: Optional metadata filters

        Returns:
            List[SearchResult]: List of search results ordered by relevance

        Example:
            results = await search.search("What is the refund policy?", top_k=3)
            for result in results:
                print(f"Score: {result.score}, Content: {result.content}")
        """
        pass

    @abstractmethod
    async def index_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Index a document for search

        Args:
            document_id: Unique identifier for the document
            content: Document text content
            metadata: Optional metadata (tags, date, etc.)

        Returns:
            dict: Indexing status with keys:
                - status: "success" or "error"
                - document_id: The indexed document ID
                - message: Status message

        Example:
            result = await search.index_document(
                "doc_123",
                "This is a sample document",
                {"category": "policy", "date": "2024-01-01"}
            )
        """
        pass

    @abstractmethod
    async def index_documents_batch(
        self,
        documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Index multiple documents in batch

        Args:
            documents: List of dicts with keys:
                - document_id: Unique identifier
                - content: Document text
                - metadata: Optional metadata dict

        Returns:
            dict: Batch indexing status with keys:
                - status: "success" or "error"
                - indexed_count: Number of documents indexed
                - failed_count: Number of failures
                - errors: List of error messages

        Example:
            docs = [
                {"document_id": "1", "content": "Doc 1", "metadata": {}},
                {"document_id": "2", "content": "Doc 2", "metadata": {}}
            ]
            result = await search.index_documents_batch(docs)
        """
        pass

    @abstractmethod
    async def delete_document(self, document_id: str) -> Dict[str, Any]:
        """
        Delete a document from the index

        Args:
            document_id: ID of document to delete

        Returns:
            dict: Deletion status with keys:
                - status: "success" or "error"
                - message: Status message
        """
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test search service connection

        Returns:
            dict: Status information with keys:
                - status: "success" or "error"
                - message: Human-readable message
                - details: Additional provider-specific info
        """
        pass

    @abstractmethod
    async def get_document_count(self) -> int:
        """
        Get total number of indexed documents

        Returns:
            int: Document count
        """
        pass
