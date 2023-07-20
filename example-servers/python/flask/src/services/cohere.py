import requests
import os

# Make sure to set the COHERE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

class Cohere:
    def generate_text(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('COHERE_API_KEY')
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        generationBody = {"prompt": body['messages'][0]['text']}
        response = requests.post(
            'https://api.cohere.ai/v1/generate', json=generationBody, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['message']:
            raise Exception(jsonResponse['message'])
        result = jsonResponse['generations'][0]['text']
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result}}
    
    def summarize_text(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('COHERE_API_KEY')
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        generationBody = {"text": body['messages'][0]['text']}
        response = requests.post(
            'https://api.cohere.ai/v1/summarize', json=generationBody, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['message']:
            raise Exception(jsonResponse['message'])
        result = response['summary']
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result}}
