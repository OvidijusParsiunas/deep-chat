import json 

def stream(jsonRequest, openAICall):
    result = openAICall(**jsonRequest)
    for resp in result:
        yield f'data: {json.dumps(resp)}\n\n'
