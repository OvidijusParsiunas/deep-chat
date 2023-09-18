import {NextFunction, Request, Response} from 'express';
import https from 'https';

// Make sure to set the COHERE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

export class Cohere {
  public static async chat(body: Request['body'], res: Response, next: NextFunction) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const chatBody = Cohere.createChatBody(body);
    const req = https.request(
      'https://api.cohere.ai/v1/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.COHERE_API_KEY,
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
          if (result.message) {
            next(result); // forwarded to error handler middleware in ErrorUtils.handle
          } else {
            // Sends response back to Deep Chat using the Response format:
            // https://deepchat.dev/docs/connect/#Response
            res.json({text: result.text});
          }
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the chat request to cohere
    req.write(JSON.stringify(chatBody));
    req.end();
  }

  private static createChatBody(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    return {
      query: body.messages[body.messages.length - 1].text,
      chat_history: body.messages.slice(0, body.messages.length - 1).map((message: {role: string; text: string}) => {
        return {user_name: message.role === 'ai' ? 'CHATBOT' : 'USER', text: message.text};
      }),
    };
  }

  public static async generateText(body: Request['body'], res: Response, next: NextFunction) {
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
        reqResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.message) {
            next(result); // forwarded to error handler middleware in ErrorUtils.handle
          } else {
            // Sends response back to Deep Chat using the Response format:
            // https://deepchat.dev/docs/connect/#Response
            res.json({text: result.generations?.[0].text});
          }
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the chat request to cohere
    req.write(JSON.stringify(generationBody));
    req.end();
  }

  public static async summarizeText(body: Request['body'], res: Response, next: NextFunction) {
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
        reqResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.message) {
            next(result); // forwarded to error handler middleware in ErrorUtils.handle
          } else {
            // Sends response back to Deep Chat using the Response format:
            // https://deepchat.dev/docs/connect/#Response
            res.json({text: result.summary});
          }
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the chat request to cohere
    req.write(JSON.stringify(summarizationBody));
    req.end();
  }
}
