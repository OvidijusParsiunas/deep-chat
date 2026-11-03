from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

class Custom:
    async def chat_stream(self, body: dict):
        print(body)
        response_chunks = "This is a response from a FastAPI server. Thank you for your message!".split(" ")
        return StreamingResponse(self.send_stream(response_chunks), media_type="text/event-stream")
    
    async def send_stream(self, response_chunks):
        for chunk in response_chunks:
            yield f"data: {json.dumps({'text': f'{chunk} '})}\n\n"
            await asyncio.sleep(0.07)  # Use asyncio.sleep for non-blocking behavior
        yield ""
custom = Custom()

@app.post("/chat")
async def chat(body: dict):
    return await custom.chat(body)

@app.post("/chat-stream")
async def chat_stream(body: dict):
    return await custom.chat_stream(body)

@app.post("/files")
async def files(request: Request, files: List[UploadFile] = File(None), text_messages: List[str] = Form(None)):
    return await custom.files(request, files, text_messages)
