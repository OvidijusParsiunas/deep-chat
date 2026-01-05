"""
Google Vertex AI LLM Provider
Implements lazy loading - imports Google SDK only when methods are called
"""
from typing import List, Dict, Any, Optional, AsyncIterator
from backend.services.interfaces.llm_base import LLMServiceInterface
import json


class GoogleVertexAIService(LLMServiceInterface):
    """
    Google Vertex AI implementation with lazy loading

    CRITICAL: No imports at module level!
    All Google SDK imports happen inside methods (_get_client)
    """

    def __init__(
        self,
        project_id: str,
        location: str,
        model_name: str = "gemini-pro",
        credentials_json: str = ""
    ):
        self.project_id = project_id
        self.location = location
        self.model_name = model_name
        self.credentials_json = credentials_json
        self._client = None  # Lazy initialization
        self._initialized = False

    def _get_client(self):
        """
        Lazy import and client initialization
        Only imports google.cloud when first needed
        """
        if not self._initialized:
            # LAZY IMPORT - Only happens when method is called
            from google.cloud import aiplatform
            from google.oauth2 import service_account

            # Initialize credentials if provided
            if self.credentials_json:
                credentials_dict = json.loads(self.credentials_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict
                )
                aiplatform.init(
                    project=self.project_id,
                    location=self.location,
                    credentials=credentials
                )
            else:
                # Use default credentials (ADC)
                aiplatform.init(
                    project=self.project_id,
                    location=self.location
                )

            self._client = aiplatform
            self._initialized = True

        return self._client

    def _convert_messages_to_gemini_format(
        self,
        messages: List[Dict[str, str]]
    ) -> tuple:
        """
        Convert OpenAI-style messages to Gemini format

        Returns:
            tuple: (system_instruction, conversation_messages)
        """
        system_instruction = None
        conversation = []

        for msg in messages:
            role = msg["role"]
            content = msg["content"]

            if role == "system":
                system_instruction = content
            elif role == "user":
                conversation.append({"role": "user", "parts": [{"text": content}]})
            elif role == "assistant":
                conversation.append({"role": "model", "parts": [{"text": content}]})

        return system_instruction, conversation

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> str:
        """Generate response using Google Vertex AI"""
        try:
            aiplatform = self._get_client()

            # LAZY IMPORT - Import GenerativeModel when needed
            from vertexai.generative_models import GenerativeModel, GenerationConfig

            # Convert messages to Gemini format
            system_instruction, conversation = self._convert_messages_to_gemini_format(messages)

            # Initialize model
            model = GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction
            )

            # Prepare generation config
            config = GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens or 2048
            )

            # Get last user message for generation
            last_message = conversation[-1]["parts"][0]["text"] if conversation else ""

            # Generate response
            response = model.generate_content(
                last_message,
                generation_config=config
            )

            return response.text

        except Exception as e:
            raise Exception(f"Google Vertex AI error: {str(e)}")

    async def generate_response_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncIterator[str]:
        """Generate streaming response using Google Vertex AI"""
        try:
            aiplatform = self._get_client()

            # LAZY IMPORT
            from vertexai.generative_models import GenerativeModel, GenerationConfig

            # Convert messages
            system_instruction, conversation = self._convert_messages_to_gemini_format(messages)

            # Initialize model
            model = GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction
            )

            # Prepare generation config
            config = GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens or 2048
            )

            # Get last user message
            last_message = conversation[-1]["parts"][0]["text"] if conversation else ""

            # Stream response
            response_stream = model.generate_content(
                last_message,
                generation_config=config,
                stream=True
            )

            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            raise Exception(f"Google Vertex AI streaming error: {str(e)}")

    async def test_connection(self) -> Dict[str, Any]:
        """Test Google Vertex AI connection"""
        try:
            aiplatform = self._get_client()

            # LAZY IMPORT
            from vertexai.generative_models import GenerativeModel

            # Initialize model and test
            model = GenerativeModel(model_name=self.model_name)

            # Simple test call
            response = model.generate_content("test")

            return {
                "status": "success",
                "message": "Successfully connected to Google Vertex AI",
                "details": {
                    "project_id": self.project_id,
                    "location": self.location,
                    "model_name": self.model_name,
                    "response_length": len(response.text) if response.text else 0
                }
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to connect to Google Vertex AI: {str(e)}",
                "error": str(e)
            }

    async def count_tokens(self, text: str) -> int:
        """
        Count tokens in text
        Approximate count for Gemini
        """
        try:
            aiplatform = self._get_client()

            # LAZY IMPORT
            from vertexai.generative_models import GenerativeModel

            model = GenerativeModel(model_name=self.model_name)

            # Count tokens
            token_count = model.count_tokens(text)
            return token_count.total_tokens

        except Exception:
            # Fallback: rough approximation (1 token ≈ 4 characters)
            return len(text) // 4
