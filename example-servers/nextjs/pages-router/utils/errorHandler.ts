import {NextRequest, NextResponse} from 'next/server';

type CallbackFunc = (req: NextRequest, res: NextResponse) => Promise<NextResponse<Response>> | Promise<Response>;

export default function errorHandler(callbacFunc: CallbackFunc) {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      return await callbacFunc(req, res);
    } catch (error) {
      console.error('API Error:', error);
      // Sends response back to Deep Chat using the Response format:
      // https://deepchat.dev/docs/connect/#Response
      return NextResponse.json({error}, {status: 500});
    }
  };
}
