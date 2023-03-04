import express, {Express, Request, Response} from 'express';
import {Configuration, OpenAIApi} from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

// !!!!!!!!!!!!!!!!!! SETUP !!!!!!!!!!!!!!!!!!

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app: Express = express();
const port = 3000;

// this will need to be reconfigured when deploying to other environments
app.use(cors());

app.use(express.json());

// !!!!!!!!!!!!!!!!!! API !!!!!!!!!!!!!!!!!!

app.post('/v1/completions', async (req: Request, res: Response) => {
  const response = await openai.createCompletion(req.body);
  res.json(response.data);
});

app.post('/v1/chat/completions', async (req: Request, res: Response) => {
  const response = await openai.createChatCompletion(req.body);
  res.json(response.data);
});

// !!!!!!!!!!!!!!!!!! START SERVER !!!!!!!!!!!!!!!!!!

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
