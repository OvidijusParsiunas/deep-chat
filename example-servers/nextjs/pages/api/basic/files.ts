import {NextRequest, NextResponse} from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  // files are stored inside form data
  const formData = await req.formData();
  formData.forEach((data) => {
    if (data instanceof File) {
      console.log('File:');
      console.log(data);
    } else {
      // if a message is sent along with files, it will also be in form data
      console.log('Message:');
      console.log(data);
    }
  });
  // Sends response back to Deep Chat using the Result format:
  // https://deepchat.dev/docs/connect/#Result
  return NextResponse.json({result: {text: 'This is a response from Next.js server. Thank you for your message!'}});
}
