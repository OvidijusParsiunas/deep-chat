import {Request, Response} from 'express';
import FormData from 'form-data';
import https from 'https';

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

  public static async chat(body: Request['body'], res: Response) {
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
            res.json({result: {text: result.choices[0].message.content}});
          }
        });
      }
    );
    req.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Send the chat request to openAI
    req.write(JSON.stringify(chatBody));
    req.end();
  }

  public static async chatStream(body: Request['body'], res: Response) {
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
        streamResp.on('error', (error) => {
          console.error('Error:', error);
          res.status(400).send(error);
        });
        streamResp.on('data', (chunk) => {
          try {
            let delta = '';
            if (chunk?.toString().match(/^\{\n\s+\"error\"\:/)) {
              console.error('Error in the retrieved stream chunk:');
              const error = JSON.parse(chunk?.toString()).error;
              console.error(error);
              return res.status(400).send(error);
            }
            const lines = chunk?.toString()?.split('\n') || [];
            const filtredLines = lines.filter((line: string) => line.trim());
            const line = filtredLines[filtredLines.length - 1];
            const data = line.toString().replace('data:', '').replace('[DONE]', '').replace('data: [DONE]', '').trim();
            if (data) {
              const result = JSON.parse(data);
              result.choices.forEach((choice: {delta?: {content: string}}) => {
                delta += choice.delta?.content || '';
              });
              // Sends response back to Deep Chat using the Result format:
              // https://deepchat.dev/docs/connect/#Result
              res.write(`data: ${JSON.stringify({result: {text: delta}})}\n\n`);
            }
          } catch (e) {
            console.error('Error when retrieving a stream chunk:', e);
            return res.status(400).send(e);
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
    req.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Send the chat request to openAI
    req.write(JSON.stringify(chatBody));
    req.end();
  }

  // By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
  public static async imageVariation(req: Request, res: Response) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if ((req.files as Express.Multer.File[])?.[0]) {
      const imageFile = (req.files as Express.Multer.File[])?.[0];
      formData.append(`image`, imageFile.buffer, imageFile.originalname);
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
            res.json({result: {files: [{type: 'image', src: result.data[0].url}]}});
          }
        });
      }
    );
    formReq.on('error', (error) => {
      console.error('Error:', error);
      res.status(400).send(error);
    });
    // Send the request to openAI
    formData.pipe(formReq);
    formReq.end();
  }
}
