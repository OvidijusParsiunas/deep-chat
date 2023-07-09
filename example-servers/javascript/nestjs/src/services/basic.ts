import {Injectable} from '@nestjs/common';
import {Request, Response} from 'express';

@Injectable()
export class Basic {
  async chat(body: Request['body']) {
    console.log(body);
    return {
      result: {
        text: 'This is a respone from a NestJs server. Thankyou for your message!',
      },
    };
  }

  async chatStream(body: Request['body'], res: Response) {
    console.log(body);
    const responseChunks = 'This is a respone from a NestJs server. Thankyou for your message!'.split(' ');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    Basic.sendStream(res, responseChunks);
  }

  private static sendStream(res: Response, responseChunks: string[], chunkIndex = 0) {
    setTimeout(() => {
      const chunk = responseChunks[chunkIndex];
      if (chunk) {
        res.write(`data: ${JSON.stringify({result: {text: `${chunk} `}})}\n\n`);
        Basic.sendStream(res, responseChunks, chunkIndex + 1);
      } else {
        res.end();
      }
    }, 70);
  }

  async files(files: Express.Multer.File[], body: Request['body']) {
    // files are stored inside a files object
    if (files) {
      console.log('Files:');
      console.log(files);
    }
    // text messages are stored inside req.body
    if (Object.keys(body).length > 0) {
      console.log('Text messages:');
      console.log(body);
    }
    return {
      result: {
        text: 'This is a respone from a NestJs server. Thankyou for your message!',
      },
    };
  }
}
