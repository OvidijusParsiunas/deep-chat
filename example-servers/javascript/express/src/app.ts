import express, {Express, Request, Response} from 'express';
import {Configuration, OpenAIApi} from 'openai';
import {requestHandler} from './requestHandler';
import {stream, Stream} from './stream';
import dotenv from 'dotenv';
import cors from 'cors';
import https from 'https';

// ------------------ SETUP ------------------

dotenv.config();

const app: Express = express();
const port = 8080;

// this will need to be reconfigured before taking the app to production
app.use(cors());

app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// ------------------ API ------------------

app.post('/v1/completions', async (req: Request, res: Response) => {
  requestHandler(req, res, openai, 'createCompletion');
});

app.post('/openai-chat', async (req: Request, res: Response) => {
  const processedBody = {
    messages: req.body.messages.map((message: {role: string; text: string}) => {
      return {role: message.role === 'ai' ? 'assistant' : message.role, content: message.text};
    }),
    model: req.body.model,
  };
  // const response = await openai.createChatCompletion(processedBody);
  // const responseBody = response.data;
  // if (responseBody.choices[0].message) {
  //   res.json({result: {text: responseBody.choices[0].message.content}});
  // } else {
  //   throw new Error('Error');
  // }

  const newReq = https.request(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
      },
    },
    (newResp) => {
      newResp.setEncoding('utf8');
      newResp.on('error', (error: any) => {
        res.status(400).send(error);
      });
      newResp.on('data', (chunk: any) => {
        const result = JSON.parse(chunk);
        res.json({result: {text: result.choices[0].message.content}});
      });
    }
  );
  newReq.on('error', (error: any) => {
    res.status(400).send(error);
  });
  newReq.write(JSON.stringify(processedBody));
  newReq.end();
});

app.post('/openai-chat/stream', async (req: Request, res: Response) => {
  const processedBody = {
    messages: req.body.messages.map((message: {role: string; text: string}) => {
      return {role: message.role === 'ai' ? 'assistant' : message.role, content: message.text};
    }),
    model: req.body.model,
    stream: true,
  };
  const newReq = https.request(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
      },
    },
    (newResp) => {
      newResp.on('error', (error: any) => {
        res.status(400).send(error);
      });

      // req.write(body);
      newResp.on('data', (chunk: any) => {
        try {
          let delta = '';
          if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
            console.error('getStream error:', chunk.toString());
            return;
          }
          const lines = chunk?.toString()?.split('\n') || [];
          const filtredLines = lines.filter((line: string) => line.trim());
          const line = filtredLines[filtredLines.length - 1];
          const data = line.toString().replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').trim();
          if (data) {
            const json = JSON.parse(data);
            json.choices.forEach((choice: any) => {
              delta += choice.text || choice.message?.content || choice.delta?.content || '';
            });
            res.write(`data: ${JSON.stringify({result: {text: delta}})}\n\n`);
          }
        } catch (e) {
          console.error('getStream handle chunk error:', e, chunk.toString());
        }
      });

      newResp.on('end', () => {
        res.end();
      });

      newResp.on('abort', () => {
        res.end();
      });
    }
  );
  newReq.on('error', (error: any) => {
    res.status(400).send(error);
  });
  newReq.write(JSON.stringify(processedBody));
  newReq.end();
});

// ------------------ START SERVER ------------------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
