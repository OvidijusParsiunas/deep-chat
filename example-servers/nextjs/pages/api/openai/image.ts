import {OpenAIImageResult} from 'deep-chat/dist/types/openAIResult';
import errorHandler from '../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';
import FormData from 'form-data';

export const config = {
  runtime: 'edge',
};

// By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
async function handler(req: NextRequest) {
  // Files are stored inside a form using Deep Chat request FormData format:
  // https://deepchat.dev/docs/connect
  const reqFormData = await req.formData();
  const file = reqFormData.get('files') as Blob;
  const openAIFormData = new FormData();
  openAIFormData.append(`image`, file, (file as File).name);

  const result = await fetch('https://api.openai.com/v1/images/variations', {
    // Be careful not to overwrite Content-Type headers as the Boundary header will not be automatically set
    headers: {Authorization: `Bearer ${process.env.OPENAI_API_KEY}`},
    method: 'POST',
    body: openAIFormData as unknown as string, // This gets rid of the type error for fetch
  });
  const openAPIResult = (await result.json()) as OpenAIImageResult;
  if (openAPIResult.error) throw openAPIResult.error.message;
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return NextResponse.json({result: {files: [{type: 'image', src: openAPIResult.data[0].url}]}});
}

export default errorHandler(handler);
