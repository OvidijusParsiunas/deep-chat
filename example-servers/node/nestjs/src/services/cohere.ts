import {Injectable} from '@nestjs/common';
import {Request} from 'express';
import axios from 'axios';

@Injectable()
export class Cohere {
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
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return {result: {text: response.data.generations?.[0].text}};
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
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return {result: {text: response.data.summary}};
  }
}
