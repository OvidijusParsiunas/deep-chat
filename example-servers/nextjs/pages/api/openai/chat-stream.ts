import {DeepChatOpenAITextRequestBody} from '../../../types/deepChatTextRequestBody';
import {createParser, ParsedEvent, ReconnectInterval} from 'eventsource-parser';
import {OpenAIConverseResult} from 'deep-chat/dist/types/openAIResult';
import {createReqChatBody} from '../../../utils/openAIChatBody';
import {NextRequest} from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const textRequestBody = (await req.json()) as DeepChatOpenAITextRequestBody;
  console.log(textRequestBody);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const chatBody = createReqChatBody(textRequestBody, true);

  const result = (await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify(chatBody),
  })) as any;

  const readableStream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data;
          if (data === '[DONE]') {
            // Signal the end of the stream
            controller.enqueue(encoder.encode('[DONE]'));
          }
          // feed the data to the TransformStream for further processing
          controller.enqueue(encoder.encode(data));
        }
      }

      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of result.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const content = decoder.decode(chunk);
      if (content === '[DONE]') {
        console.log('done, closing stream...');
        controller.terminate(); // Terminate the TransformStream
        return;
      }
      const result = JSON.parse(content) as OpenAIConverseResult;
      if (result.choices[0].delta?.content) {
        // sends response back to Deep Chat using the Result format:
        // https://deepchat.dev/docs/connect/#Result
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({result: {text: result.choices[0].delta.content}})}\n\n`)
        );
      }
    },
  });

  return new Response(readableStream.pipeThrough(transformStream), {
    headers: {'Content-Type': 'text/html; charset=utf-8'},
  });
}
