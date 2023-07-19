import {NextRequest, NextResponse} from 'next/server';
import {Result} from 'deep-chat/dist/types/result';

type CallbackFunc = (req: NextRequest, res: NextResponse) => Promise<NextResponse<Result>> | Promise<Response>;

export default function errorHandler(callbacFunc: CallbackFunc) {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      return await callbacFunc(req, res);
    } catch (error) {
      console.error('API Error:', error);
      // Sends response back to Deep Chat using the Result format:
      // https://deepchat.dev/docs/connect/#Result
      return NextResponse.json({error}, {status: 500});
    }
  };
}
