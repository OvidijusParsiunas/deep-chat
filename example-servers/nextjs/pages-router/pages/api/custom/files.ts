import errorHandler from '../../../utils/errorHandler';
import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

async function handler(req: NextRequest) {
  // Files are stored inside a form using Deep Chat request FormData format:
  // https://deepchat.dev/docs/connect
  const formData = await req.formData();
  formData.forEach((data) => {
    if (data instanceof File) {
      console.log('File:');
      console.log(data);
    } else {
      // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
      // https://deepchat.dev/docs/connect
      console.log('Message:');
      console.log(data);
    }
  });
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  return NextResponse.json({text: 'This is a response from Next.js server. Thank you for your message!'});
}

export default errorHandler(handler);
