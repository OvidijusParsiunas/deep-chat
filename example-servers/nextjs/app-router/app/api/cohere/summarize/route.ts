import {DeepChatOpenAITextRequestBody} from '../../../../types/deepChatTextRequestBody';
import {CohereSummarizationResult} from 'deep-chat/dist/types/cohereResult';
import errorHandler from '../../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';

export const runtime = 'edge';

// Make sure to set the COHERE_API_KEY environment variable

async function handler(req: NextRequest) {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const summarizationBody = (await req.json()) as DeepChatOpenAITextRequestBody;
  console.log(summarizationBody);

  const generationBody = {text: summarizationBody.messages[0].text};

  const result = await fetch('https://api.cohere.ai/v1/summarize', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify(generationBody),
  });

  const cohereResult = (await result.json()) as CohereSummarizationResult;
  if (cohereResult.message) throw cohereResult.message;
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return NextResponse.json({text: cohereResult.summary});
}

export const POST = errorHandler(handler);
