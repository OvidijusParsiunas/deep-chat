import {HuggingFaceClassificationResult} from 'deep-chat/dist/types/huggingFaceResult';
import errorHandler from '../../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';

export const runtime = 'edge';

// Make sure to set the HUGGING_FACE_API_KEY environment variable

// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
async function handler(req: NextRequest) {
  // Files are stored inside a form using Deep Chat request FormData format:
  // https://deepchat.dev/docs/connect
  const reqFormData = await req.formData();
  const file = reqFormData.get('files') as Blob;

  const result = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
    },
    method: 'POST',
    body: file,
  });

  const huggingFaceResult = (await result.json()) as HuggingFaceClassificationResult;
  if (huggingFaceResult.error) throw huggingFaceResult.error;
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return NextResponse.json({text: huggingFaceResult[0]?.label || ''});
}

export const POST = errorHandler(handler);
