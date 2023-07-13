import {DeepChatTextRequestBody} from '../../../types/deepChatTextRequestBody';
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const messageRequestBody = (await req.json()) as DeepChatTextRequestBody;
  console.log(messageRequestBody);
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return NextResponse.json({result: {text: 'This is a respone from a NextJS edge server. Thankyou for your message!'}});
}
