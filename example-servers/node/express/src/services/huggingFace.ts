import {Request, Response} from 'express';
import https from 'https';

export class HuggingFace {
  public static async conversation(body: Request['body'], res: Response) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const conversationBody = HuggingFace.createConversationBody(body.messages);
    const req = https.request(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.HUGGING_FACE_API_KEY,
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
          if (result.error) {
            console.error('Error:', result.error);
            res.status(400).send(result.error);
          } else {
            // Sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.json({result: {text: result.generated_text}});
          }
        });
      }
    );
    req.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Send the chat request to Hugging Face
    req.write(JSON.stringify(conversationBody));
    req.end();
  }

  private static createConversationBody(messages: {text: string; role: string}[]) {
    const {text} = messages[messages.length - 1];
    const previousMessages = messages.slice(0, messages.length - 1);
    if (!text) return;
    const past_user_inputs = previousMessages.filter((message) => message.role === 'user').map((message) => message.text);
    const generated_responses = previousMessages.filter((message) => message.role === 'ai').map((message) => message.text);
    return {inputs: {past_user_inputs, generated_responses, text}, wait_for_model: true};
  }

  public static async imageClassification(req: Request, res: Response) {
    const url = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
    const parseResult = (result: any) => result[0].label;
    HuggingFace.sendFile(req, res, url, parseResult);
  }

  public static async speechRecognition(req: Request, res: Response) {
    const url = 'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self';
    const parseResult = (result: any) => result.text;
    HuggingFace.sendFile(req, res, url, parseResult);
  }

  private static async sendFile(req: Request, res: Response, url: string, parseResult: (result: any) => string) {
    const fileReq = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.HUGGING_FACE_API_KEY,
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
          if (result.error) {
            console.error('Error:', result.error);
            res.status(400).send(result.error);
          } else {
            // Sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.json({result: {text: parseResult(result)}});
          }
        });
      }
    );
    fileReq.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    // Send the chat request to Hugging Face
    fileReq.write((req.files as Express.Multer.File[])[0].buffer);
    fileReq.end();
  }
}
