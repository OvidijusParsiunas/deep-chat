from services.openAI import OpenAI
from services.cohere import Cohere
from services.basic import Basic
from flask import Flask, request
from dotenv import load_dotenv
from flask_cors import CORS

# ------------------ SETUP ------------------

load_dotenv()

app = Flask(__name__)

# this will need to be reconfigured before taking the app to production
cors = CORS(app)

# ------------------ BASIC API ------------------

basic = Basic()

@app.route("/chat", methods=["POST"])
def chat():
    body = request.json
    return basic.chat(body)


@app.route("/chat-stream", methods=["POST"])
def chatStream():
    body = request.json
    return basic.chat_stream(body)


@app.route("/files", methods=["POST"])
def files():
    return basic.files(request)

# ------------------ OPENAI API ------------------


open_ai = OpenAI()


@app.route("/openai-chat", methods=["POST"])
def openaiChat():
    body = request.json
    return open_ai.chat(body)


@app.route("/openai-chat-stream", methods=["POST"])
def openaiChatStream():
    body = request.json
    return open_ai.chat_stream(body)


@app.route("/openai-image", methods=["POST"])
def openaiImage():
    files = request.files.getlist('files')
    return open_ai.image_variation(files)


# ------------------ COHERE API ------------------


cohere = Cohere()


@app.route("/cohere-generate", methods=["POST"])
def generateText():
    body = request.json
    return cohere.generateText(body)

@app.route("/cohere-summarize", methods=["POST"])
def summarizeText():
    body = request.json
    return cohere.summarizeText(body)

# ------------------ START SERVER ------------------


if __name__ == "__main__":
    app.run(port=8080)
