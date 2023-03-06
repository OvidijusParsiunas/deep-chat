import {Response} from 'express';

export interface Stream {
  data: {on: (message: string, callback: (asdsad: Object) => void) => void};
}

export async function stream(res: Response, stream: Stream) {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush headers to establish SSE with client
    stream.data.on('data', (data: any) => {
      const lines = data
        .toString()
        .split('\n')
        .filter((line: string) => line.trim() !== '');
      const message = lines[0].replace(/^data: /, '');
      if (message === '[DONE]' || JSON.parse(message).choices[0].finish_reason) {
        res.end();
        return; // Stream finished
      }
      res.write(data);
    });
    stream.data.on('error', (error) => {
      res.status(400).send(error);
    });
    res.on('close', () => {
      res.end();
    });
  } catch (error) {
    res.status(400).send(error);
  }
}
