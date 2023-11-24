import {NextFunction, Request, Response} from 'express';
import FormData from 'form-data';
import https from 'https';

// Make sure to set the OPENAI_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

export class OpenAI {
  private static createChatBody(body: Request['body'], stream?: boolean) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const chatBody = {
      messages: body.messages.map((message: {role: string; text: string}) => {
        return {role: message.role === 'ai' ? 'assistant' : message.role, content: message.text};
      }),
      model: body.model,
    } as {stream?: boolean};
    if (stream) chatBody.stream = true;
    return chatBody;
  }

  public static async chat(body: Request['body'], res: Response, next: NextFunction) {
    const chatBody = OpenAI.createChatBody(body);
    const req = https.request(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
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
            res.json({text: result.choices[0].message.content});
          }
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the chat request to openAI
    req.write(JSON.stringify(chatBody));
    req.end();
  }

  public static async chatStream(body: Request['body'], res: Response, next: NextFunction) {
    const chatBody = OpenAI.createChatBody(body, true);
    const req = https.request(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        },
      },
      (streamResp) => {
        streamResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        streamResp.on('data', (chunk) => {
          try {
            if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
              console.error('Error in the retrieved stream chunk:');
              return next(JSON.parse(chunk?.toString()).error); // forwarded to error handler middleware in ErrorUtils.handle
            }
            const lines = chunk?.toString()?.split('\n') || [];
            const filtredLines = lines.filter((line: string) => line.trim());
            filtredLines.forEach((line: string) => {
              const data = line.toString().replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').trim();
              if (data) {
                try {
                  const result = JSON.parse(data);
                  if (result.choices[0].delta?.content) {
                    // Sends response back to Deep Chat using the Response format:
                    // https://deepchat.dev/docs/connect/#Response
                    res.write(`data: ${JSON.stringify({text: result.choices[0].delta.content})}\n\n`);
                  }
                } catch (e) {} // sometimes OpenAI sends incomplete JSONs that you don't need to use
              }
            });
          } catch (error) {
            console.error('Error when retrieving a stream chunk');
            return next(error); // forwarded to error handler middleware in ErrorUtils.handle
          }
        });
        streamResp.on('end', () => {
          res.end();
        });
        streamResp.on('abort', () => {
          res.end();
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the chat request to openAI
    req.write(JSON.stringify(chatBody));
    req.end();
  }

  // By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public static async imageVariation(req: Request, res: Response, next: NextFunction) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if ((req.files as Express.Multer.File[])?.[0]) {
      const imageFile = (req.files as Express.Multer.File[])?.[0];
      formData.append('image', imageFile.buffer, imageFile.originalname);
    }
    const formReq = https.request(
      'https://api.openai.com/v1/images/variations',
      {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
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
            res.json({files: [{type: 'image', src: result.data[0].url}]});
          }
        });
      }
    );
    formReq.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the request to openAI
    formData.pipe(formReq);
    formReq.end();
  }
}
