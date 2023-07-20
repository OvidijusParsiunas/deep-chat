from flask import Response
import requests
import json
import os

# Make sure to set the OPENAI_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

class OpenAI:
    @staticmethod
    def create_chat_body(body, stream=False):
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        chat_body = {
            'messages': [
                {
                    'role': 'assistant' if message['role'] == 'ai' else message['role'],
                    'content': message['text']
                } for message in body['messages']
            ],
            'model': body['model']
        }
        if stream:
            chat_body['stream'] = True
        return chat_body

    def chat(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('OPENAI_API_KEY')
        }
        chat_body = self.create_chat_body(body)
        response = requests.post(
            'https://api.openai.com/v1/chat/completions', json=chat_body, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['error']:
            raise Exception(jsonResponse['error']['message'])
        result = jsonResponse['choices'][0]['message']['content']
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result}}

    def chat_stream(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('OPENAI_API_KEY')
        }
        chat_body = self.create_chat_body(body, stream=True)
        response = requests.post(
            'https://api.openai.com/v1/chat/completions', json=chat_body, headers=headers, stream=True)

        def generate():
            accumulated_data = ""
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    delta = ''
                    if not(chunk.decode().strip().startswith('data')):
                        errorMessage = json.loads(chunk.decode())['error']['message']
                        print('Error in the retrieved stream chunk:', errorMessage)
                        # this exception is not caught, however it signals to the user that there was an error
                        raise Exception(errorMessage)
                    lines = chunk.decode().split('\n')
                    filtered_lines = list(
                        filter(lambda line: line.strip(), lines))
                    for line in filtered_lines:
                        data = line.replace('data:', '').replace(
                            '[DONE]', '').replace('data: [DONE]', '').strip()
                        if data:
                            accumulated_data += data
                            try:
                                result = json.loads(accumulated_data)
                                for choice in result['choices']:
                                    delta += choice.get('delta',
                                                        {}).get('content', '')
                                # Sends response back to Deep Chat using the Result format:
                                # https://deepchat.dev/docs/connect/#Result
                                yield 'data: {}\n\n'.format(json.dumps({"result": {"text": delta}}))
                                accumulated_data = ""  # Reset the accumulated data
                            except json.JSONDecodeError:
                                # Incomplete JSON string, continue accumulating lines
                                pass
        return Response(generate(), mimetype='text/event-stream')

    # By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
    # You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
    def image_variation(self, files):
        url = 'https://api.openai.com/v1/images/variations'
        headers = {
            'Authorization': 'Bearer ' + os.getenv('OPENAI_API_KEY')
        }
        # Files are stored inside a files object
        image_file = files[0]
        files = {
            'image': (image_file.filename, image_file.read(), image_file.mimetype)
        }
        response = requests.post(url, files=files, headers=headers)
        jsonResponse = response.json()
        if jsonResponse['error']:
            raise Exception(jsonResponse['error']['message'])
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        result = {'result': {
            'files': [{'type': 'image', 'src': jsonResponse['data'][0]['url']}]}}
        return result
