import type {DeepChatTextRequestBody} from '../../../types/deepChatTextRequestBody';
import type {RequestHandler} from '@sveltejs/kit';

export const config = {
  runtime: 'edge',
};

export const POST: RequestHandler = async ({request}) => {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const messageRequestBody = (await request.json()) as DeepChatTextRequestBody;
  console.log(messageRequestBody);
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return new Response(
    JSON.stringify({text: 'This is a respone from a SvelteKit edge server. Thankyou for your message!'}),
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  );
};
