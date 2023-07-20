from flask import Response
import time
import json

class Custom:
    def chat(self, body):
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        print(body)
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': 'This is a respone from a Flask server. Thankyou for your message!'}}

    def chat_stream(self, body):
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        print(body)
        response_chunks = 'This is a response from a Flask server. Thank you for your message!'.split(
            ' ')
        response = Response(self.send_stream(response_chunks), mimetype='text/event-stream')
        response.headers['Content-Type'] = 'text/event-stream'
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Connection'] = 'keep-alive'
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    def send_stream(self, response_chunks, chunk_index=0):
        if chunk_index < len(response_chunks):
            chunk = response_chunks[chunk_index]
            yield f"data: {json.dumps({'result': {'text': f'{chunk} '}})}\n\n"
            time.sleep(0.07)
            yield from self.send_stream(response_chunks, chunk_index + 1)
        else:
            yield ''

    def files(self, request):
        # Files are stored inside a files object
        files = request.files.getlist('files')
        if files:
            print('Files:')
            for file in files:
                print(file.filename)

            # When sending text messages along with files - they are stored inside the data form
            textMessages = list(request.form.items())
            if len(textMessages) > 0:
                print('Text messages:')
                for key, value in textMessages:
                    print(key, value)
        else:
            # When sending text messages without any files - they are stored inside a json
            print("Text messages:")
            print(request.json)

        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': 'This is a respone from a Flask server. Thankyou for your message!'}}
