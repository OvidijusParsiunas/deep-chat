import {DeepChatOpenAITextRequestBody, DeepChatTextRequestBody} from '../../../types/deepChatTextRequestBody';
import {HuggingFaceConversationResult} from 'deep-chat/dist/types/huggingFaceResult';
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const textRequestBody = (await req.json()) as DeepChatOpenAITextRequestBody;
  console.log(textRequestBody);

  const chatBody = createReqChatBody(textRequestBody.messages);

  const result = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify(chatBody),
  });

  const huggingFaceResult = (await result.json()) as HuggingFaceConversationResult;
  if (huggingFaceResult.error) throw huggingFaceResult.error;
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return NextResponse.json({result: {text: huggingFaceResult.generated_text}});
}

function createReqChatBody(messages: DeepChatTextRequestBody['messages']) {
  const {text} = messages[messages.length - 1];
  const previousMessages = messages.slice(0, messages.length - 1);
  if (!text) return;
  const past_user_inputs = previousMessages.filter((message) => message.role === 'user').map((message) => message.text);
  const generated_responses = previousMessages.filter((message) => message.role === 'ai').map((message) => message.text);
  return {inputs: {past_user_inputs, generated_responses, text}, wait_for_model: true};
}