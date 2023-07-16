import {Request, Response} from 'express';
import https from 'https';

export class Cohere {
  public static async generateText(body: Request['body'], res: Response) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const generationBody = {prompt: body.messages[0].text};
    const req = https.request(
      'https://api.cohere.ai/v1/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.COHERE_API_KEY,
        },
      },
      (reqResp) => {
        let data = '';
        reqResp.on('error', (error) => {
          console.error('Error:', error);
          res.status(400).send(error);
        });
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.message) {
            console.error('Error:', result.message);
            res.status(400).send(result.message);
          } else {
            // Sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.json({result: {text: result.generations?.[0].text}});
          }
        });
      }
    );
    req.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Send the chat request to cohere
    req.write(JSON.stringify(generationBody));
    req.end();
  }

  public static async summarizeText(body: Request['body'], res: Response) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const summarizationBody = {text: body.messages[0].text};
    const req = https.request(
      'https://api.cohere.ai/v1/summarize',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.COHERE_API_KEY,
        },
      },
      (reqResp) => {
        let data = '';
        reqResp.on('error', (error) => {
          console.error('Error:', error);
          res.status(400).send(error);
        });
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.message) {
            console.error('Error:', result.message);
            res.status(400).send(result.message);
          } else {
            // Sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.json({result: {text: result.summary}});
          }
        });
      }
    );
    req.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Send the chat request to cohere
    req.write(JSON.stringify(summarizationBody));
    req.end();
  }
}
