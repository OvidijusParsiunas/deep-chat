import type {DeepChatTextRequestBody} from '../../types/deepChatTextRequestBody';
import type {RequestHandler} from './$types';

// WORK - not sure if this is available
export const config = {
  runtime: 'edge',
};

export const POST: RequestHandler = async ({request}) => {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const messageRequestBody = (await request.json()) as DeepChatTextRequestBody;
  console.log(messageRequestBody);
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return new Response(
    JSON.stringify({result: {text: 'This is a respone from a NextJS edge server. Thankyou for your message!'}})
  );
};
