import express, {Express, Request, Response} from 'express';
import {HuggingFace} from './services/huggingFace';
import {OpenAI} from './services/openAI';
import {Cohere} from './services/cohere';
import {Basic} from './services/basic';
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

app.post('/chat', async (req: Request, res: Response) => {
  Basic.chat(req.body, res);
});

app.post('/chat-stream', async (req: Request, res: Response) => {
  Basic.chatStream(req.body, res);
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

// ------------------ HUGGING FACE API ------------------

app.post('/huggingface-chat', async (req: Request, res: Response) => {
  HuggingFace.chat(req.body, res);
});

app.post('/huggingface-image', upload.array('files'), async (req: Request, res: Response) => {
  HuggingFace.imageClassification(req, res);
});

app.post('/huggingface-speech', upload.array('files'), async (req: Request, res: Response) => {
  HuggingFace.speechRecognition(req, res);
});

// ------------------ Cohere API ------------------

app.post('/cohere-generate', async (req: Request, res: Response) => {
  Cohere.generateText(req.body, res);
});

app.post('/cohere-summarize', async (req: Request, res: Response) => {
  Cohere.summarizeText(req.body, res);
});

// ------------------ START SERVER ------------------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
