import {NextFunction, Request, Response} from 'express';

export class ErrorUtils {
  public static handle(error: Error, _: Request, res: Response, next: NextFunction) {
    console.error('Error:', error.message);
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    res.status(500).send({error: error.message});
  }
}
