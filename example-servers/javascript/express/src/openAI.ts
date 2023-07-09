import {Request, Response} from 'express';
import FormData from 'form-data';
import https from 'https';

export class OpenAI {
  private static createChatBody(body: Request['body'], stream?: boolean) {
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
          res.status(400).send(error);
        });
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.error) {
            console.error('Error:');
            console.error(result.error);
            res.status(400).send(result.error);
          } else {
            // sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.json({result: {text: result.choices[0].message.content}});
          }
        });
      }
    );
    req.on('error', (error) => {
      res.status(400).send(error);
    });
    // send the chat request to openAI
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
              // sends response back to Deep Chat using the Result format:
              // https://deepchat.dev/docs/connect/#Result
              res.write(`data: ${JSON.stringify({result: {text: delta}})}\n\n`);
            }
          } catch (e) {
            console.error('Error when retrieving a stream chunk:');
            console.error(e);
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
      res.status(400).send(error);
    });
    // send the chat request to openAI
    req.write(JSON.stringify(chatBody));
    req.end();
  }

  public static async imageVariation(req: Request, res: Response) {
    // INFO - files are stored inside req.files and text messages inside req.body
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
          res.status(400).send(error);
        });
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          const result = JSON.parse(data);
          if (result.error) {
            console.error('Error:');
            console.error(result.error);
            res.status(400).send(result.error);
          } else {
            // sends response back to Deep Chat using the Result format:
            // https://deepchat.dev/docs/connect/#Result
            res.json({result: {files: [{type: 'image', src: result.data[0].url}]}});
          }
        });
      }
    );
    formReq.on('error', (error) => {
      res.status(400).send(error);
    });
    // send the request to openAI
    formData.pipe(formReq);
    formReq.end();
  }
}

// app.post('/openai-create-image', async (req: Request, res: Response) => {
//   const processedBody = {
//     prompt: req.body.messages[req.body.messages.length - 1].text,
//   };

//   const newReq = https.request(
//     'https://api.openai.com/v1/images/generations',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
//       },
//     },
//     (newResp) => {
//       let data = '';
//       newResp.on('error', (error: any) => {
//         res.status(400).send(error);
//       });
//       newResp.on('data', (chunk: any) => {
//         data += chunk;
//       });
//       newResp.on('end', () => {
//         const result = JSON.parse(data);
//         res.json({result: {files: [{type: 'image', src: result.data[0].url}]}});
//       });
//     }
//   );
//   newReq.on('error', (error: any) => {
//     res.status(400).send(error);
//   });
//   newReq.write(JSON.stringify(processedBody));
//   newReq.end();
// });
