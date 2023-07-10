import {Injectable} from '@nestjs/common';
import {Request, Response} from 'express';
import * as FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class OpenAI {
  private static createChatBody(body: Request['body'], stream?: boolean) {
    const chatBody = {
      messages: body.messages.map((message: {role: string; text: string}) => {
        return {
          role: message.role === 'ai' ? 'assistant' : message.role,
          content: message.text,
        };
      }),
      model: body.model,
    } as {stream?: boolean};
    if (stream) chatBody.stream = true;
    return chatBody;
  }

  async chat(body: Request['body']) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', OpenAI.createChatBody(body), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
      },
    });
    // sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return {result: {text: response.data.choices[0].message.content}};
  }

  async chatStream(body: Request['body'], res: Response) {
    try {
      const stream = await axios.post('https://api.openai.com/v1/chat/completions', OpenAI.createChatBody(body, true), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        },
        responseType: 'stream',
      });
      stream.data.on('data', (chunk) => {
        try {
          let delta = '';
          if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
            console.error('Error in the retrieved stream chunk:');
            const error = JSON.parse(chunk?.toString()).error;
            console.error(error);
            return res.status(400).send(error);
          }
          const lines = chunk?.toString()?.split('\n') || [];
          const filtredLines = lines.filter((line: string) => line.trim());
          const line = filtredLines[filtredLines.length - 1];
          const data = line.toString().replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').trim();
          if (data) {
            const result = JSON.parse(data);
            result.choices.forEach((choice: {delta?: {content: string}}) => {
              delta += choice.delta?.content || '';
            });
            // sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.write(`data: ${JSON.stringify({result: {text: delta}})}\n\n`);
          }
        } catch (e) {
          console.error('Error when retrieving a stream chunk:');
          console.error(e);
          return res.status(400).send(e);
        }
      });
      stream.data.on('end', () => {
        res.end();
      });
      stream.data.on('abort', () => {
        res.end();
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async imageVariation(files: Array<Express.Multer.File>) {
    const formData = new FormData();
    if (files[0]) {
      formData.append(`image`, files[0].buffer, files[0].originalname);
    }
    const response = await axios.post('https://api.openai.com/v1/images/variations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
      },
    });
    // sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return {
      result: {files: [{type: 'image', src: response.data.data[0].url}]},
    };
  }
}
