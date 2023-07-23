import {DeepChatOpenAITextRequestBody} from '../types/deepChatTextRequestBody';

export function createReqChatBody(body: DeepChatOpenAITextRequestBody, stream?: boolean) {
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  const chatBody = {
    messages: body.messages.map((message) => {
      return {role: message.role === 'ai' ? 'assistant' : message.role, content: message.text};
    }),
    model: body.model,
  } as {stream?: boolean};
  if (stream) chatBody.stream = true;
  return chatBody;
}
