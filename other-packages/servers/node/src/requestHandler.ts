import {Request, Response} from 'express';
import {stream, Stream} from './stream';
import {OpenAIApi} from 'openai';

// TO-DO - mention that the final message will need to be [DONE]

// prettier-ignore
export async function requestHandler(req: Request, res: Response,
    openai: OpenAIApi, type: 'createCompletion' | 'createChatCompletion') {
  const response = await openai[type](req.body, req.body.stream ? {responseType: 'stream'} : {});
  if (req.body.stream) {
    stream(res, response as unknown as Stream);
  } else {
    res.json(response.data);
  }
}
