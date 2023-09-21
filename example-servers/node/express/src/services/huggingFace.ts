import {NextFunction, Request, Response} from 'express';
import https from 'https';

// Make sure to set the HUGGING_FACE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

export class HuggingFace {
  public static async conversation(body: Request['body'], res: Response, next: NextFunction) {
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
        reqResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.error) {
            next(result.error); // forwarded to error handler middleware in ErrorUtils.handle
          } else {
            // Sends response back to Deep Chat using the Response format:
            // https://deepchat.dev/docs/connect/#Response
            res.json({text: result.generated_text});
          }
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
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

  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public static async imageClassification(req: Request, res: Response, next: NextFunction) {
    const url = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
    const parseResult = (result: any) => result[0].label;
    HuggingFace.sendFile(req, res, url, parseResult, next);
  }

  // You can use an example audio file here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a
  public static async speechRecognition(req: Request, res: Response, next: NextFunction) {
    const url = 'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self';
    const parseResult = (result: any) => result.text;
    HuggingFace.sendFile(req, res, url, parseResult, next);
  }

  // prettier-ignore
  private static async sendFile(
      req: Request, res: Response, url: string, parseResult: (result: any) => string, next: NextFunction) {
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
        reqResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.error) {
            next(result.error); // forwarded to error handler middleware in ErrorUtils.handle
          } else {
            // Sends response back to Deep Chat using the Response format:
            // https://deepchat.dev/docs/connect/#Response
            res.json({text: parseResult(result)});
          }
        });
      }
    );
    fileReq.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    // Send the chat request to Hugging Face
    fileReq.write((req.files as Express.Multer.File[])[0].buffer);
    fileReq.end();
  }
}
