from requestHandler import requestHandler
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask
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
    return requestHandler(openai.Completion.create)

@app.route("/v1/chat/completions", methods = ["POST"])
def chat():
    return requestHandler(openai.ChatCompletion.create)

if __name__ == "__main__":
   app.run(port = 3000)
