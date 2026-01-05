"""
Abstract base class for Storage service providers
Defines the interface for file upload, retrieval, and management
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, BinaryIO
from datetime import datetime


class StorageFile:
    """Represents a file in storage"""

    def __init__(
        self,
        filename: str,
        url: str,
        size_bytes: int,
        content_type: Optional[str] = None,
        uploaded_at: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.filename = filename
        self.url = url
        self.size_bytes = size_bytes
        self.content_type = content_type
        self.uploaded_at = uploaded_at or datetime.utcnow()
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "filename": self.filename,
            "url": self.url,
            "size_bytes": self.size_bytes,
            "content_type": self.content_type,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "metadata": self.metadata
        }


class StorageServiceInterface(ABC):
    """
    Abstract interface for Storage providers
    Supports both Azure Blob Storage and Google Cloud Storage
    """

    @abstractmethod
    async def upload_file(
        self,
        file_data: bytes,
        filename: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StorageFile:
        """
        Upload a file to storage

        Args:
            file_data: File content as bytes
            filename: Name of the file
            content_type: MIME type (e.g., "application/pdf")
            metadata: Optional metadata to attach to file

        Returns:
            StorageFile: Uploaded file information with URL

        Example:
            with open("document.pdf", "rb") as f:
                file_data = f.read()

            uploaded = await storage.upload_file(
                file_data,
                "document.pdf",
                content_type="application/pdf",
                metadata={"user_id": "123"}
            )
            print(f"File URL: {uploaded.url}")
        """
        pass

    @abstractmethod
    async def upload_file_stream(
        self,
        file_stream: BinaryIO,
        filename: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StorageFile:
        """
        Upload a file from a stream (for large files)

        Args:
            file_stream: File-like object to read from
            filename: Name of the file
            content_type: MIME type
            metadata: Optional metadata

        Returns:
            StorageFile: Uploaded file information
        """
        pass

    @abstractmethod
    async def download_file(self, filename: str) -> bytes:
        """
        Download a file from storage

        Args:
            filename: Name of the file to download

        Returns:
            bytes: File content

        Example:
            file_data = await storage.download_file("document.pdf")
            with open("downloaded.pdf", "wb") as f:
                f.write(file_data)
        """
        pass

    @abstractmethod
    async def get_file_url(
        self,
        filename: str,
        expiration_seconds: Optional[int] = None
    ) -> str:
        """
        Get a URL for accessing a file

        Args:
            filename: Name of the file
            expiration_seconds: Optional expiration time for signed URL
                               None = permanent URL (if supported)

        Returns:
            str: URL to access the file

        Example:
            # Get a URL valid for 1 hour
            url = await storage.get_file_url("document.pdf", expiration_seconds=3600)
        """
        pass

    @abstractmethod
    async def list_files(
        self,
        prefix: Optional[str] = None,
        max_results: Optional[int] = None
    ) -> List[StorageFile]:
        """
        List files in storage

        Args:
            prefix: Optional prefix to filter files (e.g., "uploads/2024/")
            max_results: Maximum number of files to return

        Returns:
            List[StorageFile]: List of files

        Example:
            files = await storage.list_files(prefix="uploads/", max_results=100)
            for file in files:
                print(f"{file.filename} - {file.size_bytes} bytes")
        """
        pass

    @abstractmethod
    async def delete_file(self, filename: str) -> Dict[str, Any]:
        """
        Delete a file from storage

        Args:
            filename: Name of the file to delete

        Returns:
            dict: Deletion status with keys:
                - status: "success" or "error"
                - message: Status message

        Example:
            result = await storage.delete_file("old_document.pdf")
            if result["status"] == "success":
                print("File deleted successfully")
        """
        pass

    @abstractmethod
    async def file_exists(self, filename: str) -> bool:
        """
        Check if a file exists in storage

        Args:
            filename: Name of the file to check

        Returns:
            bool: True if file exists, False otherwise
        """
        pass

    @abstractmethod
    async def get_file_metadata(self, filename: str) -> Optional[StorageFile]:
        """
        Get metadata for a file without downloading it

        Args:
            filename: Name of the file

        Returns:
            Optional[StorageFile]: File metadata, or None if not found
        """
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test storage service connection

        Returns:
            dict: Status information with keys:
                - status: "success" or "error"
                - message: Human-readable message
                - details: Additional provider-specific info

        Example:
            result = await storage.test_connection()
            if result["status"] == "success":
                print("Storage connection successful!")
        """
        pass
