import requests
import os

# Make sure to set the COHERE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

class Cohere:
    def chat(self, body):
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("COHERE_API_KEY")
        }
        chat_body = self.create_chat_body(body)
        response = requests.post(
            "https://api.cohere.ai/v1/chat", json=chat_body, headers=headers)
        json_response = response.json()
        if "message" in json_response:
            raise Exception(json_response["message"])
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"text": json_response["text"]}

    @staticmethod
    def create_chat_body(body):
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        return {
            'query': body['messages'][len(body['messages']) - 1]['text'],
            'chat_history': [
                {
                    'user_name': 'CHATBOT' if message['role'] == 'ai' else 'USER',
                    'text': message['text']
                } for message in body['messages'][:-1]
            ],
        }

    def generate_text(self, body):
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("COHERE_API_KEY")
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        generation_body = {"prompt": body["messages"][0]["text"]}
        response = requests.post(
            "https://api.cohere.ai/v1/generate", json=generation_body, headers=headers)
        json_response = response.json()
        if "message" in json_response:
            raise Exception(json_response["message"])
        result = json_response["generations"][0]["text"]
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"text": result}
    
    def summarize_text(self, body):
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("COHERE_API_KEY")
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        summarization_body = {"text": body["messages"][0]["text"]}
        response = requests.post(
            "https://api.cohere.ai/v1/summarize", json=summarization_body, headers=headers)
        json_response = response.json()
        if "message" in json_response:
            raise Exception(json_response["message"])
        result = json_response["summary"]
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"text": result}
