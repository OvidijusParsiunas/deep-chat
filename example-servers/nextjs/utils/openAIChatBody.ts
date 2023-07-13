import {DeepChatOpenAITextRequestBody} from '../types/deepChatTextRequestBody';

export function createReqChatBody(body: DeepChatOpenAITextRequestBody, stream?: boolean) {
  const chatBody = {
    messages: body.messages.map((message) => {
      return {role: message.role === 'ai' ? 'assistant' : message.role, content: message.text};
    }),
    model: body.model,
  } as {stream?: boolean};
  if (stream) chatBody.stream = true;
  return chatBody;
}
