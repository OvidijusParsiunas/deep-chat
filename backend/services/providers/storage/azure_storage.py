"""
Azure Blob Storage Provider
Implements lazy loading - imports Azure SDK only when methods are called
"""
from typing import List, Dict, Any, Optional, BinaryIO
from backend.services.interfaces.storage_base import StorageServiceInterface, StorageFile
from datetime import datetime, timedelta
import uuid


class AzureBlobStorageService(StorageServiceInterface):
    """
    Azure Blob Storage implementation with lazy loading

    CRITICAL: No imports at module level!
    All Azure SDK imports happen inside methods (_get_client)
    """

    def __init__(
        self,
        connection_string: str,
        container_name: str = "qiyas-uploads"
    ):
        self.connection_string = connection_string
        self.container_name = container_name
        self._blob_service_client = None  # Lazy initialization
        self._container_client = None  # Lazy initialization

    def _get_blob_service_client(self):
        """
        Lazy import and blob service client initialization
        Only imports Azure SDK when first needed
        """
        if self._blob_service_client is None:
            # LAZY IMPORT
            from azure.storage.blob import BlobServiceClient

            self._blob_service_client = BlobServiceClient.from_connection_string(
                self.connection_string
            )
        return self._blob_service_client

    def _get_container_client(self):
        """
        Lazy import and container client initialization
        Creates container if it doesn't exist
        """
        if self._container_client is None:
            blob_service = self._get_blob_service_client()
            self._container_client = blob_service.get_container_client(
                self.container_name
            )

            # Create container if it doesn't exist
            try:
                self._container_client.create_container()
            except Exception:
                # Container already exists, ignore
                pass

        return self._container_client

    def _generate_unique_filename(self, filename: str) -> str:
        """Generate unique filename with UUID prefix"""
        unique_id = str(uuid.uuid4())[:8]
        return f"{unique_id}_{filename}"

    async def upload_file(
        self,
        file_data: bytes,
        filename: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StorageFile:
        """Upload a file to Azure Blob Storage"""
        try:
            container_client = self._get_container_client()

            # Generate unique filename
            blob_name = self._generate_unique_filename(filename)

            # Get blob client
            blob_client = container_client.get_blob_client(blob_name)

            # Prepare upload parameters
            upload_kwargs = {}
            if content_type:
                upload_kwargs["content_settings"] = {
                    "content_type": content_type
                }
            if metadata:
                # Convert all metadata values to strings
                upload_kwargs["metadata"] = {
                    k: str(v) for k, v in metadata.items()
                }

            # Upload file
            blob_client.upload_blob(file_data, overwrite=True, **upload_kwargs)

            # Get blob URL
            blob_url = blob_client.url

            return StorageFile(
                filename=blob_name,
                url=blob_url,
                size_bytes=len(file_data),
                content_type=content_type,
                uploaded_at=datetime.utcnow(),
                metadata=metadata or {}
            )

        except Exception as e:
            raise Exception(f"Azure Blob Storage upload error: {str(e)}")

    async def upload_file_stream(
        self,
        file_stream: BinaryIO,
        filename: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StorageFile:
        """Upload a file from a stream"""
        try:
            container_client = self._get_container_client()

            # Generate unique filename
            blob_name = self._generate_unique_filename(filename)

            # Get blob client
            blob_client = container_client.get_blob_client(blob_name)

            # Prepare upload parameters
            upload_kwargs = {}
            if content_type:
                upload_kwargs["content_settings"] = {
                    "content_type": content_type
                }
            if metadata:
                upload_kwargs["metadata"] = {
                    k: str(v) for k, v in metadata.items()
                }

            # Upload stream
            blob_client.upload_blob(file_stream, overwrite=True, **upload_kwargs)

            # Get blob properties for size
            properties = blob_client.get_blob_properties()

            return StorageFile(
                filename=blob_name,
                url=blob_client.url,
                size_bytes=properties.size,
                content_type=content_type,
                uploaded_at=datetime.utcnow(),
                metadata=metadata or {}
            )

        except Exception as e:
            raise Exception(f"Azure Blob Storage stream upload error: {str(e)}")

    async def download_file(self, filename: str) -> bytes:
        """Download a file from Azure Blob Storage"""
        try:
            container_client = self._get_container_client()
            blob_client = container_client.get_blob_client(filename)

            # Download blob
            blob_data = blob_client.download_blob()
            return blob_data.readall()

        except Exception as e:
            raise Exception(f"Azure Blob Storage download error: {str(e)}")

    async def get_file_url(
        self,
        filename: str,
        expiration_seconds: Optional[int] = None
    ) -> str:
        """Get a URL for accessing a file"""
        try:
            container_client = self._get_container_client()
            blob_client = container_client.get_blob_client(filename)

            if expiration_seconds:
                # LAZY IMPORT
                from azure.storage.blob import generate_blob_sas, BlobSasPermissions

                # Generate SAS token
                sas_token = generate_blob_sas(
                    account_name=blob_client.account_name,
                    container_name=self.container_name,
                    blob_name=filename,
                    account_key=self._extract_account_key(),
                    permission=BlobSasPermissions(read=True),
                    expiry=datetime.utcnow() + timedelta(seconds=expiration_seconds)
                )

                return f"{blob_client.url}?{sas_token}"
            else:
                # Return permanent URL (assumes public access or existing permissions)
                return blob_client.url

        except Exception as e:
            raise Exception(f"Azure Blob Storage URL generation error: {str(e)}")

    def _extract_account_key(self) -> str:
        """Extract account key from connection string"""
        parts = dict(part.split('=', 1) for part in self.connection_string.split(';') if '=' in part)
        return parts.get('AccountKey', '')

    async def list_files(
        self,
        prefix: Optional[str] = None,
        max_results: Optional[int] = None
    ) -> List[StorageFile]:
        """List files in Azure Blob Storage"""
        try:
            container_client = self._get_container_client()

            # List blobs
            blobs = container_client.list_blobs(name_starts_with=prefix)

            files = []
            for blob in blobs:
                files.append(StorageFile(
                    filename=blob.name,
                    url=f"{container_client.url}/{blob.name}",
                    size_bytes=blob.size,
                    content_type=blob.content_settings.content_type if blob.content_settings else None,
                    uploaded_at=blob.last_modified,
                    metadata=blob.metadata or {}
                ))

                if max_results and len(files) >= max_results:
                    break

            return files

        except Exception as e:
            raise Exception(f"Azure Blob Storage list error: {str(e)}")

    async def delete_file(self, filename: str) -> Dict[str, Any]:
        """Delete a file from Azure Blob Storage"""
        try:
            container_client = self._get_container_client()
            blob_client = container_client.get_blob_client(filename)

            blob_client.delete_blob()

            return {
                "status": "success",
                "message": f"File {filename} deleted successfully"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Delete error: {str(e)}"
            }

    async def file_exists(self, filename: str) -> bool:
        """Check if a file exists"""
        try:
            container_client = self._get_container_client()
            blob_client = container_client.get_blob_client(filename)

            return blob_client.exists()

        except Exception:
            return False

    async def get_file_metadata(self, filename: str) -> Optional[StorageFile]:
        """Get metadata for a file without downloading it"""
        try:
            container_client = self._get_container_client()
            blob_client = container_client.get_blob_client(filename)

            properties = blob_client.get_blob_properties()

            return StorageFile(
                filename=filename,
                url=blob_client.url,
                size_bytes=properties.size,
                content_type=properties.content_settings.content_type if properties.content_settings else None,
                uploaded_at=properties.last_modified,
                metadata=properties.metadata or {}
            )

        except Exception:
            return None

    async def test_connection(self) -> Dict[str, Any]:
        """Test Azure Blob Storage connection"""
        try:
            blob_service = self._get_blob_service_client()
            container_client = self._get_container_client()

            # Test by getting container properties
            properties = container_client.get_container_properties()

            return {
                "status": "success",
                "message": "Successfully connected to Azure Blob Storage",
                "details": {
                    "container_name": self.container_name,
                    "container_exists": True,
                    "last_modified": properties.last_modified.isoformat() if properties.last_modified else None
                }
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to Azure Blob Storage: {str(e)}",
                "error": str(e)
            }
