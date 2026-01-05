"""
Azure OpenAI LLM Provider
Implements lazy loading - imports Azure SDK only when methods are called
"""
from typing import List, Dict, Any, Optional, AsyncIterator
from backend.services.interfaces.llm_base import LLMServiceInterface


class AzureOpenAIService(LLMServiceInterface):
    """
    Azure OpenAI implementation with lazy loading

    CRITICAL: No imports at module level!
    All Azure SDK imports happen inside methods (_get_client)
    """

    def __init__(
        self,
        api_key: str,
        endpoint: str,
        deployment: str,
        api_version: str = "2024-02-15-preview"
    ):
        self.api_key = api_key
        self.endpoint = endpoint
        self.deployment = deployment
        self.api_version = api_version
        self._client = None  # Lazy initialization

    def _get_client(self):
        """
        Lazy import and client initialization
        Only imports openai when first needed
        """
        if self._client is None:
            # LAZY IMPORT - Only happens when method is called
            from openai import AzureOpenAI

            self._client = AzureOpenAI(
                api_key=self.api_key,
                azure_endpoint=self.endpoint,
                api_version=self.api_version
            )
        return self._client

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> str:
        """Generate response using Azure OpenAI"""
        try:
            client = self._get_client()

            # Prepare request parameters
            params = {
                "model": self.deployment,
                "messages": messages,
                "temperature": temperature
            }

            if max_tokens is not None:
                params["max_tokens"] = max_tokens

            # Make API call
            response = client.chat.completions.create(**params)

            return response.choices[0].message.content

        except Exception as e:
            raise Exception(f"Azure OpenAI error: {str(e)}")

    async def generate_response_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncIterator[str]:
        """Generate streaming response using Azure OpenAI"""
        try:
            client = self._get_client()

            # Prepare request parameters
            params = {
                "model": self.deployment,
                "messages": messages,
                "temperature": temperature,
                "stream": True
            }

            if max_tokens is not None:
                params["max_tokens"] = max_tokens

            # Make streaming API call
            response = client.chat.completions.create(**params)

            for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            raise Exception(f"Azure OpenAI streaming error: {str(e)}")

    async def test_connection(self) -> Dict[str, Any]:
        """Test Azure OpenAI connection"""
        try:
            client = self._get_client()

            # Simple test call
            response = client.chat.completions.create(
                model=self.deployment,
                messages=[{"role": "user", "content": "test"}],
                max_tokens=5
            )

            return {
                "status": "success",
                "message": "Successfully connected to Azure OpenAI",
                "details": {
                    "deployment": self.deployment,
                    "endpoint": self.endpoint,
                    "api_version": self.api_version,
                    "model": response.model
                }
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to Azure OpenAI: {str(e)}",
                "error": str(e)
            }

    async def count_tokens(self, text: str) -> int:
        """
        Count tokens in text using tiktoken
        Approximate count if tiktoken not available
        """
        try:
            # Lazy import tiktoken
            import tiktoken

            encoding = tiktoken.encoding_for_model("gpt-4")
            return len(encoding.encode(text))

        except ImportError:
            # Fallback: rough approximation (1 token ≈ 4 characters)
            return len(text) // 4
        except Exception:
            # Fallback
            return len(text) // 4
