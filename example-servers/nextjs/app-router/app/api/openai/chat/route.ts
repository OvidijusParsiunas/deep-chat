import {DeepChatOpenAITextRequestBody} from '../../../../types/deepChatTextRequestBody';
import {OpenAIConverseResult} from 'deep-chat/dist/types/openAIResult';
import {createReqChatBody} from '../../../../utils/openAIChatBody';
import errorHandler from '../../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';

export const runtime = 'edge';

// Make sure to set the OPENAI_API_KEY environment variable

async function handler(req: NextRequest) {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const textRequestBody = (await req.json()) as DeepChatOpenAITextRequestBody;
  console.log(textRequestBody);

  const chatBody = createReqChatBody(textRequestBody);

  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify(chatBody),
  });

  const openAIResult = (await result.json()) as OpenAIConverseResult;
  if (openAIResult.error) throw openAIResult.error.message;
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return NextResponse.json({text: openAIResult.choices[0].message?.content || ''});
}

export const POST = errorHandler(handler);
