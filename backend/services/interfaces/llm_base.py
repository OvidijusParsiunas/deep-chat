"""
Abstract base class for LLM service providers
Defines the interface that all LLM providers must implement
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncIterator


class LLMServiceInterface(ABC):
    """
    Abstract interface for LLM providers
    Supports both Azure OpenAI and Google Vertex AI
    """

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> str:
        """
        Generate AI response from conversation history

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate (None = provider default)
            stream: Whether to stream the response

        Returns:
            str: Generated response text

        Example:
            messages = [
                {"role": "user", "content": "Hello, how are you?"}
            ]
            response = await llm.generate_response(messages)
        """
        pass

    @abstractmethod
    async def generate_response_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncIterator[str]:
        """
        Generate AI response as a stream

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate

        Yields:
            str: Chunks of generated text

        Example:
            async for chunk in llm.generate_response_stream(messages):
                print(chunk, end='', flush=True)
        """
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test provider connection and credentials

        Returns:
            dict: Status information with keys:
                - status: "success" or "error"
                - message: Human-readable message
                - details: Additional provider-specific info

        Example:
            result = await llm.test_connection()
            if result["status"] == "success":
                print("Connection successful!")
        """
        pass

    @abstractmethod
    async def count_tokens(self, text: str) -> int:
        """
        Count tokens in text (for cost estimation)

        Args:
            text: Text to count tokens for

        Returns:
            int: Approximate token count
        """
        pass
