import express, { Express, NextFunction, Request, Response } from 'express'
import { HuggingFace } from './services/huggingFace'
import { StabilityAI } from './services/stabilityAI'
import { ErrorUtils } from './utils/errorUtils'
// import { Custom } from './services/custom'
import { OpenRouter } from './services/openRouter'
import { OpenAI } from './services/openAI'
import { Cohere } from './services/cohere'
import dotenv from 'dotenv'
import multer from 'multer'
import cors from 'cors'

// ------------------ SETUP ------------------

dotenv.config()

// this is used for parsing FormData
const upload = multer()

const app: Express = express()
const port = 8080

// this will need to be reconfigured before taking the app to production

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']

const corsOptions = {
  origin: (origin: string, callback: Function) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}



app.use(cors(corsOptions as any))

app.use(express.json())

const Custom = OpenRouter

// ------------------ CUSTOM API ------------------

app.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  Custom.chat(req.body, res, next)
})

app.post('/chat-stream', async (req: Request, res: Response, next: NextFunction) => {
  Custom.chatStream(req.body, res, next)
})

app.post('/files', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  // Note: OpenRouter doesn't have a files method, using imageVariation for file handling
  if (req.files && (req.files as Express.Multer.File[]).length > 0) {
    OpenRouter.imageVariation(req, res, next)
  } else {
    // For text-only requests, use chat
    OpenRouter.chat(req.body, res, next)
  }
})

// ------------------ OPENAI API ------------------

app.post('/openai-chat', async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.chat(req.body, res, next)
})

app.post('/openai-chat-stream', async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.chatStream(req.body, res, next)
})

app.post('/openai-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  OpenAI.imageVariation(req, res, next)
})

// ------------------ HUGGING FACE API ------------------

app.post('/huggingface-conversation', async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.conversation(req.body, res, next)
})

app.post('/huggingface-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.imageClassification(req, res, next)
})

app.post('/huggingface-speech', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  HuggingFace.speechRecognition(req, res, next)
})

// ------------------ STABILITY AI API ------------------

app.post('/stability-text-to-image', async (req: Request, res: Response, next: NextFunction) => {
  StabilityAI.textToImage(req.body, res, next)
})

app.post('/stability-image-to-image', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  StabilityAI.imageToImage(req, res, next)
})

app.post('/stability-image-upscale', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  StabilityAI.imageToImageUpscale(req, res, next)
})

// ------------------ Cohere API ------------------

app.post('/cohere-chat', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.chat(req.body, res, next)
})

app.post('/cohere-generate', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.generateText(req.body, res, next)
})

app.post('/cohere-summarize', async (req: Request, res: Response, next: NextFunction) => {
  Cohere.summarizeText(req.body, res, next)
})

// ------------------ START SERVER ------------------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

// ------------------ ERROR HANDLER ------------------

app.use(ErrorUtils.handle)
