import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {RequestDetails} from '../../types/interceptors';
import {ServiceIO} from '../../services/serviceIO';
import {RequestUtils} from './requestUtils';
import {Response} from '../../types/response';
import {Stream} from './stream';

export class CustomRequest {
  public static async request(io: ServiceIO, body: RequestDetails['body'], messages: Messages) {
    io.requestSettings
      .handler?.(body)
      .then(async (result: Response) => {
        if (!io.extractResultData) return; // this return should theoretically not execute
        const finalResult = (await io.deepChat.responseInterceptor?.(result)) || result;
        const resultData = await io.extractResultData(finalResult);
        if (!resultData || typeof resultData !== 'object')
          throw Error(ErrorMessages.INVALID_RESPONSE(result, 'response', !!io.deepChat.responseInterceptor, resultData));
        if (io.deepChat.stream && resultData.text) {
          Stream.simulate(messages, io.streamHandlers, resultData.text);
        } else {
          messages.addNewMessage(resultData, true, true);
          io.completionsHandlers.onFinish();
        }
      })
      .catch((err) => {
        RequestUtils.displayError(messages, err);
        io.completionsHandlers.onFinish();
      });
  }
}
