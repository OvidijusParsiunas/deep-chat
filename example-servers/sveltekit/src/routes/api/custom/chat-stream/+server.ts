import type {DeepChatTextRequestBody} from '../../../types/deepChatTextRequestBody';
import type {RequestHandler} from '@sveltejs/kit';

export const config = {
  runtime: 'edge',
  // this is used to enable streaming
  dynamic: 'force-dynamic',
};

export const POST: RequestHandler = async ({request}) => {
  const messageRequestBody = (await request.json()) as DeepChatTextRequestBody;
  // Text messages are stored inside request body using the Deep Chat JSON format:
  // https://deepchat.dev/docs/connect
  console.log(messageRequestBody);

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const responseChunks = 'This is a response from a SvelteKit server. Thank you for your message!'.split(' ');
    sendStream(writer, encoder, responseChunks);
  } catch (err) {
    console.log(JSON.stringify(err));
    throw err;
  }

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
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
        // Sends response back to Deep Chat using the Response format:
        // https://deepchat.dev/docs/connect/#Response
        writer.write(encoder.encode(`data: ${JSON.stringify({text: `${chunk} `})}\n\n`));
        sendStream(writer, encoder, responseChunks, chunkIndex + 1);
      } else {
        writer.close();
      }
    }, 70);
  }
};
