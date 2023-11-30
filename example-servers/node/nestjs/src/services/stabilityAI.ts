import {Injectable} from '@nestjs/common';
import * as FormData from 'form-data';
import {Request} from 'express';
import axios from 'axios';

// Make sure to set the STABILITY_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

@Injectable()
export class StabilityAI {
  async textToImage(body: Request['body']) {
    const descriptionBody = {text_prompts: [{text: body.messages[0].text}]};
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
      descriptionBody,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.STABILITY_API_KEY,
        },
      }
    );
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {files: [{type: 'image', src: `data:image/png;base64,${response.data.artifacts[0].base64}`}]};
  }

  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  async imageToImage(files: Array<Express.Multer.File>, body: Request['body']) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if (files[0]) {
      formData.append('init_image', files[0].buffer, files[0].originalname);
      // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
      // https://deepchat.dev/docs/connect
      formData.append('text_prompts[0][text]', JSON.parse(body.message1).text);
      formData.append('text_prompts[0][weight]', 1);
    }
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.STABILITY_API_KEY,
        },
      }
    );
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {files: [{type: 'image', src: `data:image/png;base64,${response.data.artifacts[0].base64}`}]};
  }

  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  async imageToImageUpscale(files: Array<Express.Multer.File>) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const formData = new FormData();
    if (files[0]) {
      formData.append('image', files[0].buffer, files[0].originalname);
    }
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.STABILITY_API_KEY,
        },
      }
    );
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {files: [{type: 'image', src: `data:image/png;base64,${response.data.artifacts[0].base64}`}]};
  }
}
