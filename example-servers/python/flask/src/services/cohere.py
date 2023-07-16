import requests
import os


class Cohere:
    def generateText(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('COHERE_API_KEY')
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        generationBody = {"prompt": body['messages'][0]['text']}
        response = requests.post(
            'https://api.cohere.ai/v1/generate', json=generationBody, headers=headers)
        result = response.json()['generations'][0]['text']
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result}}
    
    def summarizeText(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('COHERE_API_KEY')
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        generationBody = {"text": body['messages'][0]['text']}
        response = requests.post(
            'https://api.cohere.ai/v1/summarize', json=generationBody, headers=headers)
        result = response.json()['summary']
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result}}
