import {OpenAIImageResult} from 'deep-chat/dist/types/openAIResult';
import errorHandler from '../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

// Make sure to set the OPENAI_API_KEY environment variable

// By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
async function handler(req: NextRequest) {
  // Files are stored inside a form using Deep Chat request FormData format:
  // https://deepchat.dev/docs/connect
  const reqFormData = await req.formData();
  const file = reqFormData.get('files') as Blob;
  const openAIFormData = new FormData();
  openAIFormData.append('image', file);

  const result = await fetch('https://api.openai.com/v1/images/variations', {
    // Be careful not to overwrite Content-Type headers as the Boundary header will not be automatically set
    headers: {Authorization: `Bearer ${process.env.OPENAI_API_KEY}`},
    method: 'POST',
    body: openAIFormData as unknown as string, // This gets rid of the type error for fetch
  });
  const openAIResult = (await result.json()) as OpenAIImageResult;
  if (openAIResult.error) throw openAIResult.error.message;
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return NextResponse.json({files: [{type: 'image', src: openAIResult.data[0].url}]});
}

export default errorHandler(handler);
