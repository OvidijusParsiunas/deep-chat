import {Injectable} from '@nestjs/common';
import {Request} from 'express';
import axios from 'axios';

// Make sure to set the HUGGING_FACE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

@Injectable()
export class HuggingFace {
  async conversation(body: Request['body']) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const conversationBody = HuggingFace.createConversationBody(body.messages);
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      conversationBody,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.HUGGING_FACE_API_KEY,
        },
      }
    );
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: response.data.generated_text};
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
  async imageClassification(files: Array<Express.Multer.File>) {
    const parseResult = (result: any) => result[0].label;
    const url = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
    return this.sendFile(files, url, parseResult);
  }

  // You can use an example audio file here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a
  async speechRecognition(files: Array<Express.Multer.File>) {
    const parseResult = (result: any) => result.text;
    const url = 'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self';
    return this.sendFile(files, url, parseResult);
  }

  private async sendFile(files: Array<Express.Multer.File>, url: string, parseResult: (result: any) => string) {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    const response = await axios.post(url, files[0].buffer, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.HUGGING_FACE_API_KEY,
      },
    });
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return {text: parseResult(response.data)};
  }
}
