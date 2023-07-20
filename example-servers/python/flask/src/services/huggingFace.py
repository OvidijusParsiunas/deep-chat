import requests
import os

# Make sure to set the HUGGING_FACE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

class HuggingFace:
    def conversation(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('HUGGING_FACE_API_KEY')
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        conversation_body = self.create_conversation_body(body['messages'])
        response = requests.post(
            'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', json=conversation_body, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['error']:
            raise Exception(jsonResponse['error'])
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': jsonResponse['generated_text']}}

    @staticmethod
    def create_conversation_body(messages):
        text = messages[-1]['text']
        previous_messages = messages[:-1]
        if not text:
            return None
        past_user_inputs = [message['text'] for message in previous_messages if message['role'] == 'user']
        generated_responses = [message['text'] for message in previous_messages if message['role'] == 'ai']
        return {'inputs': {'past_user_inputs': past_user_inputs, 'generated_responses': generated_responses, 'text': text}, 'wait_for_model': True}


    def image_classification(self, files):
        headers = {
            'Authorization': 'Bearer ' + os.getenv('HUGGING_FACE_API_KEY')
        }
        # Files are stored inside a files object
        data=files[0].read()
        response = requests.post(
            'https://api-inference.huggingface.co/models/google/vit-base-patch16-224', data=data, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['error']:
            raise Exception(jsonResponse['error'])
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': jsonResponse[0]['label']}}
    
    def speech_recognition(self, files):
        headers = {
            'Authorization': 'Bearer ' + os.getenv('HUGGING_FACE_API_KEY')
        }
        # Files are stored inside a files object
        data=files[0].read()
        response = requests.post(
            'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self', data=data, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['error']:
            raise Exception(jsonResponse['error'])
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': jsonResponse['text']}}
