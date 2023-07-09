import express, {Express, Request, Response} from 'express';
import {OpenAI} from './openAI';
import {Basic} from './basic';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';

// ------------------ SETUP ------------------

dotenv.config();

// this is used for parsing FormData
const upload = multer();

const app: Express = express();
const port = 8080;

// this will need to be reconfigured before taking the app to production
app.use(cors());

app.use(express.json());

// ------------------ BASIC API ------------------

app.post('/chat', async (_, res: Response) => {
  Basic.chat(res);
});

app.post('/chat-stream', async (_, res: Response) => {
  Basic.chatStream(res);
});

app.post('/files', upload.array('files'), async (req: Request, res: Response) => {
  Basic.files(req, res);
});

// ------------------ OPENAI API ------------------

app.post('/openai-chat', async (req: Request, res: Response) => {
  OpenAI.chat(req.body, res);
});

app.post('/openai-chat-stream', async (req: Request, res: Response) => {
  OpenAI.chatStream(req.body, res);
});

app.post('/openai-image', upload.array('files'), async (req: Request, res: Response) => {
  OpenAI.imageVariation(req, res);
});

// ------------------ START SERVER ------------------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
