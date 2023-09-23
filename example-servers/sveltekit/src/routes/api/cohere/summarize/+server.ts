import type {DeepChatOpenAITextRequestBody} from '../../../types/deepChatTextRequestBody';
import type {CohereSummarizationResult} from 'deep-chat/dist/types/cohereResult';
import type {RequestHandler} from '@sveltejs/kit';

export const config = {
  runtime: 'edge',
};

// Make sure to set the COHERE_API_KEY environment variable

export const POST: RequestHandler = async ({request}) => {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const summarizationBody = (await request.json()) as DeepChatOpenAITextRequestBody;
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
  return new Response(JSON.stringify({text: cohereResult.summary}), {
    headers: {
      'content-type': 'application/json',
    },
  });
};
