import {Injectable} from '@nestjs/common';
import {Request, Response} from 'express';
import * as FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class OpenAI {
  private static createChatBody(body: Request['body'], stream?: boolean) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
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
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return {result: {text: response.data.choices[0].message.content}};
  }

  async chatStream(body: Request['body'], res: Response) {
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
          // WORK - test this
          throw JSON.parse(chunk?.toString()).error;
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
          // Sends response back to Deep Chat using the Result format:
          // https://deepchat.dev/docs/connect/#Result
          res.write(`data: ${JSON.stringify({result: {text: delta}})}\n\n`);
        }
      } catch (e) {
        console.error('Error when retrieving a stream chunk');
        throw e;
      }
    });
    stream.data.on('end', () => {
      res.end();
    });
    stream.data.on('abort', () => {
      res.end();
    });
  }

  // By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
  async imageVariation(files: Array<Express.Multer.File>) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
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
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return {
      result: {files: [{type: 'image', src: response.data.data[0].url}]},
    };
  }
}
