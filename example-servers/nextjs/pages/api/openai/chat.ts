import {DeepChatOpenAITextRequestBody} from '../../../types/deepChatTextRequestBody';
import {OpenAIConverseResult} from 'deep-chat/dist/types/openAIResult';
import {createReqChatBody} from '../../../utils/openAIChatBody';
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const textRequestBody = (await req.json()) as DeepChatOpenAITextRequestBody;
  console.log(textRequestBody);

  const chatBody = createReqChatBody(textRequestBody);

  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify(chatBody),
  });

  const openAPIResult = (await result.json()) as OpenAIConverseResult;
  if (openAPIResult.error) throw openAPIResult.error.message;
  // sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return NextResponse.json({result: {text: openAPIResult.choices[0].message.content}});
}
