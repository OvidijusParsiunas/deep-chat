import {OpenAIImageResult} from 'deep-chat/dist/types/openAIResult';
import {NextRequest, NextResponse} from 'next/server';
import FormData from 'form-data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
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
