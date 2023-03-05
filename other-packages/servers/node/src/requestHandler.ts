import {handleStream, Stream} from './stream';
import {Request, Response} from 'express';
import {OpenAIApi} from 'openai';

// prettier-ignore
export async function requestHandler(req: Request, res: Response,
      openai: OpenAIApi, type: 'createCompletion' | 'createChatCompletion') {
    const response = await openai[type](req.body, req.body.stream ? {responseType: 'stream'} : {});
    if (req.body.stream) {
      handleStream(res, response as unknown as Stream);
    } else {
      res.json(response.data);
    }
}
