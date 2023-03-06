from flask import request, Response
from stream import stream
        
def requestHandler(openAICall):
    if "stream" in request.json:
      return Response(stream(request.json, openAICall), mimetype='text/event-stream')
    else:
      result = openAICall(**request.json)
      return result