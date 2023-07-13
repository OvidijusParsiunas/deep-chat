import {DeepChatTextRequestBody} from '../../../types/deepChatTextRequestBody';
import {NextRequest} from 'next/server';

export const runtime = 'edge';

// this is used to enable streaming
export const dynamic = 'force-dynamic';

export default async function handler(req: NextRequest) {
  const messageRequestBody = (await req.json()) as DeepChatTextRequestBody;
  console.log(messageRequestBody);

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const responseChunks = 'This is a response from a NextJS server. Thank you for your message!'.split(' ');
    sendStream(writer, encoder, responseChunks);
  } catch (err) {
    console.log(JSON.stringify(err));
    throw err;
  }

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });

  function sendStream(
    writer: WritableStreamDefaultWriter<any>,
    encoder: TextEncoder,
    responseChunks: string[],
    chunkIndex = 0
  ) {
    setTimeout(() => {
      const chunk = responseChunks[chunkIndex];
      if (chunk) {
        // Sends response back to Deep Chat using the Result format:
        // https://deepchat.dev/docs/connect/#Result
        writer.write(encoder.encode(`data: ${JSON.stringify({result: {text: `${chunk} `}})}\n\n`));
        sendStream(writer, encoder, responseChunks, chunkIndex + 1);
      } else {
        writer.close();
      }
    }, 70);
  }
}
