import express, {Express, NextFunction, Request, Response} from 'express';
import {HuggingFace} from './services/huggingFace';
import {ErrorUtils} from './utils/errorUtils';
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

app.post('/openai-chat', async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.chat(req.body, res, next);
});

app.post('/openai-chat-stream', async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.chatStream(req.body, res, next);
});

app.post('/openai-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.imageVariation(req, res, next);
});

// ------------------ HUGGING FACE API ------------------

app.post('/huggingface-conversation', async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.conversation(req.body, res, next);
});

app.post('/huggingface-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.imageClassification(req, res, next);
});

app.post('/huggingface-speech', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.speechRecognition(req, res, next);
});

// ------------------ Cohere API ------------------

app.post('/cohere-generate', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.generateText(req.body, res, next);
});

app.post('/cohere-summarize', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.summarizeText(req.body, res, next);
});

// ------------------ START SERVER ------------------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// ------------------ ERROR HANDLER ------------------

app.use(ErrorUtils.handle);
