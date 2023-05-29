from flask import request, Response
from stream import stream

# TO-DO - mention that the final message will need to be [DONE]

def requestHandler(openAICall):
    if "stream" in request.json:
      return Response(stream(request.json, openAICall), mimetype='text/event-stream')
    else:
      result = openAICall(**request.json)
      return result