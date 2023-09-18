import {Injectable} from '@nestjs/common';
import {Request, Response} from 'express';

@Injectable()
export class Custom {
  async chat(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    console.log(body);
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: 'This is a respone from a NestJs server. Thankyou for your message!'};
  }

  async chatStream(body: Request['body'], res: Response) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    console.log(body);
    const responseChunks = 'This is a respone from a NestJs server. Thankyou for your message!'.split(' ');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    Custom.sendStream(res, responseChunks);
  }

  private static sendStream(res: Response, responseChunks: string[], chunkIndex = 0) {
    setTimeout(() => {
      const chunk = responseChunks[chunkIndex];
      if (chunk) {
        // Sends response back to Deep Chat using the Response format:
        // https://deepchat.dev/docs/connect/#Response
        res.write(`data: ${JSON.stringify({text: `${chunk} `})}\n\n`);
        Custom.sendStream(res, responseChunks, chunkIndex + 1);
      } else {
        res.end();
      }
    }, 70);
  }

  async files(files: Express.Multer.File[], body: Request['body']) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    if (files) {
      console.log('Files:');
      console.log(files);
    }
    // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    if (Object.keys(body).length > 0) {
      console.log('Text messages:');
      // message objects are stored as strings and they will need to be parsed (JSON.parse) before processing
      console.log(body);
    }
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: 'This is a respone from a NestJs server. Thankyou for your message!'};
  }
}
