import {Injectable} from '@nestjs/common';
import {Request, Response} from 'express';
import * as FormData from 'form-data';
import axios from 'axios';

// Make sure to set the OPENAI_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

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
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: response.data.choices[0].message.content};
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
        if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
          throw JSON.parse(chunk?.toString()).error;
        }
        const lines = chunk?.toString()?.split('\n') || [];
        const filtredLines = lines.filter((line: string) => line.trim());
        filtredLines.forEach((line: string) => {
          const data = line.toString().replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').trim();
          if (data) {
            try {
              const result = JSON.parse(data);
              if (result.choices[0].delta?.content) {
                // Sends response back to Deep Chat using the Response format:
                // https://deepchat.dev/docs/connect/#Response
                res.write(`data: ${JSON.stringify({text: result.choices[0].delta.content})}\n\n`);
              }
            } catch (e) {} // sometimes OpenAI responds with an incomplete JSON that you don't need to use
          }
        });
      } catch (e) {
        console.error('Error when retrieving a stream chunk');
        console.log(e);
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
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  async imageVariation(files: Array<Express.Multer.File>) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if (files[0]) {
      formData.append('image', files[0].buffer, files[0].originalname);
    }
    const response = await axios.post('https://api.openai.com/v1/images/variations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
      },
    });
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {files: [{type: 'image', src: response.data.data[0].url}]};
  }
}
