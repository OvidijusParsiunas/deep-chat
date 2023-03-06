from flask import Flask, request
from dotenv import load_dotenv
from flask_cors import CORS
import openai
import os

# !!!!!!!!!!!!!!!!!! SETUP !!!!!!!!!!!!!!!!!!

load_dotenv()

app = Flask(__name__)

# this will need to be reconfigured before taking the app to production
cors = CORS(app)

openai.api_key = os.getenv('OPENAI_API_KEY')

# !!!!!!!!!!!!!!!!!! API !!!!!!!!!!!!!!!!!!

@app.route("/v1/completions", methods = ["POST"])
def completions():
    result = openai.Completion.create(**request.json)
    return result

@app.route("/v1/chat/completions", methods = ["POST"])
def chat():
    result = openai.ChatCompletion.create(**request.json)
    return result

if __name__ == "__main__":
   app.run(port = 3000)
