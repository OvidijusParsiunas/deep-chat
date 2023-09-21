import requests
import os

# Make sure to set the HUGGING_FACE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

class HuggingFace:
    def conversation(self, body):
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("HUGGING_FACE_API_KEY")
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        conversation_body = self.create_conversation_body(body["messages"])
        response = requests.post(
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", json=conversation_body, headers=headers)
        json_response = response.json()
        if "error" in json_response:
            raise Exception(json_response["error"])
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"text": json_response["generated_text"]}

    @staticmethod
    def create_conversation_body(messages):
        text = messages[-1]["text"]
        previous_messages = messages[:-1]
        if not text:
            return None
        past_user_inputs = [message["text"] for message in previous_messages if message["role"] == "user"]
        generated_responses = [message["text"] for message in previous_messages if message["role"] == "ai"]
        return {"inputs": {"past_user_inputs": past_user_inputs, "generated_responses": generated_responses, "text": text}, "wait_for_model": True}

    # You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
    def image_classification(self, files):
        headers = {
            "Authorization": "Bearer " + os.getenv("HUGGING_FACE_API_KEY")
        }
        # Files are stored inside a files object
        # https://deepchat.dev/docs/connect
        data=files[0].read()
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/vit-base-patch16-224", data=data, headers=headers)
        json_response = response.json()
        if "error" in json_response:
            raise Exception(json_response["error"])
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"text": json_response[0]["label"]}
    
    # You can use an example audio file here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a
    def speech_recognition(self, files):
        headers = {
            "Authorization": "Bearer " + os.getenv("HUGGING_FACE_API_KEY")
        }
        # Files are stored inside a files object
        # https://deepchat.dev/docs/connect
        data=files[0].read()
        response = requests.post(
            "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self", data=data, headers=headers)
        json_response = response.json()
        if "error" in json_response:
            raise Exception(json_response["error"])
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"text": json_response["text"]}
