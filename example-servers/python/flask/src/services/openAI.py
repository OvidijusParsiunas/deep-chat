from flask import Response
import requests
import json
import os

class OpenAI:
  @staticmethod
  def create_chat_body(body, stream=False):
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
    response = requests.post('https://api.openai.com/v1/chat/completions', json=chat_body, headers=headers)
    result = response.json()['choices'][0]['message']['content']
    # sends response back to Deep Chat using the Result format:
    # https://deepchat.dev/docs/connect/#Result
    return {'result': {'text': result}}


  def chat_stream(self, body):
    try:
      headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + os.getenv('OPENAI_API_KEY')
      }
      chat_body = self.create_chat_body(body, stream=True)
      response = requests.post('https://api.openai.com/v1/chat/completions', json=chat_body, headers=headers, stream=True)

      def generate():
        accumulated_data = ""
        for chunk in response.iter_content(chunk_size=1024):
          if chunk:
            delta = ''
            if chunk.decode().strip().startswith('{"error":'):
              print('Error in the retrieved stream chunk:')
              error = json.loads(chunk.decode())['error']
              print(error)
              yield json.dumps(error), 400
              return
            lines = chunk.decode().split('\n')
            filtered_lines = list(filter(lambda line: line.strip(), lines))
            for line in filtered_lines:
              data = line.replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').strip()
              if data:
                accumulated_data += data
                try:
                  result = json.loads(accumulated_data)
                  for choice in result['choices']:
                    delta += choice.get('delta', {}).get('content', '')
                  # sends response back to Deep Chat using the Result format:
                  # https://deepchat.dev/docs/connect/#Result
                  yield 'data: {}\n\n'.format(json.dumps({"result": {"text": delta}}))
                  accumulated_data = ""  # Reset the accumulated data
                except json.JSONDecodeError:
                  # Incomplete JSON string, continue accumulating lines
                  pass
        return Response(generate(), mimetype='text/event-stream')
    except Exception as e:
      print('Error when retrieving a stream chunk:')
      print(e)
      return Response(json.dumps(str(e)), status=400, mimetype='application/json')


  def image_variation(self, files):
    url = 'https://api.openai.com/v1/images/variations'
    headers = {
      'Authorization': 'Bearer ' + os.getenv('OPENAI_API_KEY')
    }
    image_file = files[0]
    files = {
      'image': (image_file.filename, image_file.read(), image_file.mimetype)
    }
    response = requests.post(url, files=files, headers=headers)
    # sends response back to Deep Chat using the Result format:
    # https://deepchat.dev/docs/connect/#Result
    result = {'result': {'files': [ {'type': 'image', 'src': response.json()['data'][0]['url']}]}}
    return result
