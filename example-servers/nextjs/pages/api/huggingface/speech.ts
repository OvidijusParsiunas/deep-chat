import {HuggingFaceAudioRecognitionResult} from 'deep-chat/dist/types/huggingFaceResult';
import errorHandler from '../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

// Make sure to set the HUGGING_FACE_API_KEY environment variable

async function handler(req: NextRequest) {
  // Files are stored inside a form using Deep Chat request FormData format:
  // https://deepchat.dev/docs/connect
  const reqFormData = await req.formData();
  const file = reqFormData.get('files') as Blob;

  const result = await fetch('https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
    },
    method: 'POST',
    body: file,
  });

  const huggingFaceResult = (await result.json()) as HuggingFaceAudioRecognitionResult;
  if (huggingFaceResult.error) throw huggingFaceResult.error;
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return NextResponse.json({result: {text: huggingFaceResult.text}});
}

export default errorHandler(handler);
