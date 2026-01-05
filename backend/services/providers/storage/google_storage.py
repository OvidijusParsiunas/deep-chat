"""
Google Cloud Storage Provider
Implements lazy loading - imports Google SDK only when methods are called
"""
from typing import List, Dict, Any, Optional, BinaryIO
from backend.services.interfaces.storage_base import StorageServiceInterface, StorageFile
from datetime import datetime, timedelta
import json
import uuid


class GoogleCloudStorageService(StorageServiceInterface):
    """
    Google Cloud Storage implementation with lazy loading

    CRITICAL: No imports at module level!
    All Google SDK imports happen inside methods (_get_client)
    """

    def __init__(
        self,
        bucket_name: str,
        credentials_json: str = ""
    ):
        self.bucket_name = bucket_name
        self.credentials_json = credentials_json
        self._storage_client = None  # Lazy initialization
        self._bucket = None  # Lazy initialization
        self._initialized = False

    def _get_client(self):
        """
        Lazy import and storage client initialization
        Only imports Google SDK when first needed
        """
        if not self._initialized:
            # LAZY IMPORT
            from google.cloud import storage
            from google.oauth2 import service_account

            # Initialize credentials if provided
            if self.credentials_json:
                credentials_dict = json.loads(self.credentials_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict
                )
                self._storage_client = storage.Client(credentials=credentials)
            else:
                # Use default credentials (ADC)
                self._storage_client = storage.Client()

            self._bucket = self._storage_client.bucket(self.bucket_name)
            self._initialized = True

        return self._storage_client, self._bucket

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
        """Upload a file to Google Cloud Storage"""
        try:
            _, bucket = self._get_client()

            # Generate unique filename
            blob_name = self._generate_unique_filename(filename)

            # Get blob
            blob = bucket.blob(blob_name)

            # Set metadata if provided
            if metadata:
                blob.metadata = {k: str(v) for k, v in metadata.items()}

            # Upload file
            blob.upload_from_string(
                file_data,
                content_type=content_type or 'application/octet-stream'
            )

            # Get blob URL
            blob_url = blob.public_url

            return StorageFile(
                filename=blob_name,
                url=blob_url,
                size_bytes=len(file_data),
                content_type=content_type,
                uploaded_at=datetime.utcnow(),
                metadata=metadata or {}
            )

        except Exception as e:
            raise Exception(f"Google Cloud Storage upload error: {str(e)}")

    async def upload_file_stream(
        self,
        file_stream: BinaryIO,
        filename: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StorageFile:
        """Upload a file from a stream"""
        try:
            _, bucket = self._get_client()

            # Generate unique filename
            blob_name = self._generate_unique_filename(filename)

            # Get blob
            blob = bucket.blob(blob_name)

            # Set metadata if provided
            if metadata:
                blob.metadata = {k: str(v) for k, v in metadata.items()}

            # Upload from file stream
            blob.upload_from_file(
                file_stream,
                content_type=content_type or 'application/octet-stream'
            )

            # Reload blob to get size
            blob.reload()

            return StorageFile(
                filename=blob_name,
                url=blob.public_url,
                size_bytes=blob.size,
                content_type=content_type,
                uploaded_at=datetime.utcnow(),
                metadata=metadata or {}
            )

        except Exception as e:
            raise Exception(f"Google Cloud Storage stream upload error: {str(e)}")

    async def download_file(self, filename: str) -> bytes:
        """Download a file from Google Cloud Storage"""
        try:
            _, bucket = self._get_client()
            blob = bucket.blob(filename)

            # Download blob
            return blob.download_as_bytes()

        except Exception as e:
            raise Exception(f"Google Cloud Storage download error: {str(e)}")

    async def get_file_url(
        self,
        filename: str,
        expiration_seconds: Optional[int] = None
    ) -> str:
        """Get a URL for accessing a file"""
        try:
            _, bucket = self._get_client()
            blob = bucket.blob(filename)

            if expiration_seconds:
                # Generate signed URL
                url = blob.generate_signed_url(
                    expiration=timedelta(seconds=expiration_seconds),
                    method='GET'
                )
                return url
            else:
                # Return public URL
                return blob.public_url

        except Exception as e:
            raise Exception(f"Google Cloud Storage URL generation error: {str(e)}")

    async def list_files(
        self,
        prefix: Optional[str] = None,
        max_results: Optional[int] = None
    ) -> List[StorageFile]:
        """List files in Google Cloud Storage"""
        try:
            client, bucket = self._get_client()

            # List blobs
            blobs = bucket.list_blobs(prefix=prefix, max_results=max_results)

            files = []
            for blob in blobs:
                files.append(StorageFile(
                    filename=blob.name,
                    url=blob.public_url,
                    size_bytes=blob.size,
                    content_type=blob.content_type,
                    uploaded_at=blob.time_created,
                    metadata=blob.metadata or {}
                ))

            return files

        except Exception as e:
            raise Exception(f"Google Cloud Storage list error: {str(e)}")

    async def delete_file(self, filename: str) -> Dict[str, Any]:
        """Delete a file from Google Cloud Storage"""
        try:
            _, bucket = self._get_client()
            blob = bucket.blob(filename)

            blob.delete()

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
            _, bucket = self._get_client()
            blob = bucket.blob(filename)

            return blob.exists()

        except Exception:
            return False

    async def get_file_metadata(self, filename: str) -> Optional[StorageFile]:
        """Get metadata for a file without downloading it"""
        try:
            _, bucket = self._get_client()
            blob = bucket.blob(filename)

            # Reload to get properties
            blob.reload()

            return StorageFile(
                filename=filename,
                url=blob.public_url,
                size_bytes=blob.size,
                content_type=blob.content_type,
                uploaded_at=blob.time_created,
                metadata=blob.metadata or {}
            )

        except Exception:
            return None

    async def test_connection(self) -> Dict[str, Any]:
        """Test Google Cloud Storage connection"""
        try:
            client, bucket = self._get_client()

            # Test by checking if bucket exists
            exists = bucket.exists()

            if exists:
                # Get bucket info
                bucket.reload()

                return {
                    "status": "success",
                    "message": "Successfully connected to Google Cloud Storage",
                    "details": {
                        "bucket_name": self.bucket_name,
                        "bucket_exists": True,
                        "location": bucket.location,
                        "storage_class": bucket.storage_class
                    }
                }
            else:
                return {
                    "status": "error",
                    "message": f"Bucket '{self.bucket_name}' does not exist",
                    "error": "Bucket not found"
                }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to Google Cloud Storage: {str(e)}",
                "error": str(e)
            }
