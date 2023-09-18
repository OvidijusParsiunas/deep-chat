import {Injectable} from '@nestjs/common';
import {Request} from 'express';
import axios from 'axios';

// Make sure to set the COHERE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

@Injectable()
export class Cohere {
  async chat(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const chatBody = Cohere.createChatBody(body);
    const response = await axios.post('https://api.cohere.ai/v1/chat', chatBody, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.COHERE_API_KEY,
      },
    });
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: response.data.text};
  }

  private static createChatBody(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    return {
      query: body.messages[body.messages.length - 1].text,
      chat_history: body.messages.slice(0, body.messages.length - 1).map((message: {role: string; text: string}) => {
        return {user_name: message.role === 'ai' ? 'CHATBOT' : 'USER', text: message.text};
      }),
    };
  }

  async generateText(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const generationBody = {prompt: body.messages[0].text};
    const response = await axios.post('https://api.cohere.ai/v1/generate', generationBody, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.COHERE_API_KEY,
      },
    });
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: response.data.generations?.[0].text};
  }

  async summarizeText(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const summarizationBody = {text: body.messages[0].text};
    const response = await axios.post('https://api.cohere.ai/v1/summarize', summarizationBody, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.COHERE_API_KEY,
      },
    });
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: response.data.summary};
  }
}
