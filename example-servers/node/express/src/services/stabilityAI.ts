import {NextFunction, Request, Response} from 'express';
import FormData from 'form-data';
import https from 'https';

// Make sure to set the STABILITY_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

export class StabilityAI {
  public static async textToImage(body: Request['body'], res: Response, next: NextFunction) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const descriptionBody = {text_prompts: [{text: body.messages[0].text}]};
    const req = https.request(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.STABILITY_API_KEY,
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
            res.json({files: [{type: 'image', src: `data:image/png;base64,${result.artifacts[0].base64}`}]});
          }
        });
      }
    );
    req.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the chat request to Stability AI
    req.write(JSON.stringify(descriptionBody));
    req.end();
  }

  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public static async imageToImage(req: Request, res: Response, next: NextFunction) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if ((req.files as Express.Multer.File[])?.[0]) {
      const imageFile = (req.files as Express.Multer.File[])?.[0];
      formData.append('init_image', imageFile.buffer, imageFile.originalname);
      // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
      // https://deepchat.dev/docs/connect
      formData.append('text_prompts[0][text]', JSON.parse(req.body.message1).text);
      formData.append('text_prompts[0][weight]', 1);
    }
    const formReq = https.request(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image',
      {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          Authorization: 'Bearer ' + process.env.STABILITY_API_KEY,
        },
      },
      (reqResp) => {
        let data = '';
        reqResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.message) {
              next(result); // forwarded to error handler middleware in ErrorUtils.handle
            } else {
              // Sends response back to Deep Chat using the Response format:
              // https://deepchat.dev/docs/connect/#Response
              res.json({files: [{type: 'image', src: `data:image/png;base64,${result.artifacts[0].base64}`}]});
            }
          } catch (e) {
            next(e);
          }
        });
      }
    );
    formReq.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the request to Stability AI
    formData.pipe(formReq);
    formReq.end();
  }

  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public static async imageToImageUpscale(req: Request, res: Response, next: NextFunction) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if ((req.files as Express.Multer.File[])?.[0]) {
      const imageFile = (req.files as Express.Multer.File[])?.[0];
      formData.append('image', imageFile.buffer, imageFile.originalname);
    }
    const formReq = https.request(
      'https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale',
      {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          Authorization: 'Bearer ' + process.env.STABILITY_API_KEY,
        },
      },
      (reqResp) => {
        let data = '';
        reqResp.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
        reqResp.on('data', (chunk) => {
          data += chunk;
        });
        reqResp.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.message) {
              next(result); // forwarded to error handler middleware in ErrorUtils.handle
            } else {
              // Sends response back to Deep Chat using the Response format:
              // https://deepchat.dev/docs/connect/#Response
              res.json({files: [{type: 'image', src: `data:image/png;base64,${result.artifacts[0].base64}`}]});
            }
          } catch (e) {
            next(e);
          }
        });
      }
    );
    formReq.on('error', next); // forwarded to error handler middleware in ErrorUtils.handle
    // Send the request to Stability AI
    formData.pipe(formReq);
    formReq.end();
  }
}
