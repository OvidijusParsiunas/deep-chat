import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {ServiceIO, StreamHandlers} from '../../services/serviceIO';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {Stream as StreamI} from '../../types/stream';
import {CustomHandler} from './customHandler';
import {RequestUtils} from './requestUtils';
import {Demo} from '../demo/demo';

type SimulationSH = Omit<StreamHandlers, 'abortStream'> & {abortStream: {abort: () => void}};

export class Stream {
  // prettier-ignore
  public static async request(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers: interceptedHeaders, error} =
      (await RequestUtils.processRequestInterceptor(io.deepChat, requestDetails));
    const {onOpen, onClose, abortStream} = io.streamHandlers;
    if (error) return Stream.onInterceptorError(messages, error, onClose);
    if (io.requestSettings?.handler) return CustomHandler.stream(io, interceptedBody, messages);
    if (io.requestSettings?.url === Demo.URL) return Demo.requestStream(messages, io.streamHandlers);
    let streamBubble: HTMLElement | undefined;
    fetchEventSource(io.requestSettings?.url || io.url || '', {
      method: io.requestSettings?.method || 'POST',
      headers: interceptedHeaders,
      credentials: io.requestSettings?.credentials,
      body: stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody,
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          return onOpen();
        }
        const result = await RequestUtils.processResponseByType(response);
        throw result;
      },
      onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          const response = JSON.parse(message.data) as unknown as OpenAIConverseResult;
          io.extractResultData?.(response)
            .then((textBody?: ResponseI) => {
              // do not to stop the stream on one message failure to give other messages a change to display
              streamBubble ??= messages.updatedStreamedMessage(streamBubble, textBody);
            })
            .catch((e) => RequestUtils.displayError(messages, e));
        }
      },
      onerror(err) {
        onClose();
        throw err; // need to throw otherwise stream will retry infinitely
      },
      onclose() {
        messages.finaliseStreamedMessage();
        onClose();
      },
      signal: abortStream.signal,
    }).catch((err) => {
      // allowing extractResultData to attempt extract error message and throw it
      io.extractResultData?.(err)
        .then(() => {
          RequestUtils.displayError(messages, err);
        })
        .catch((parsedError) => {
          RequestUtils.displayError(messages, parsedError);
        });
    });
  }

  private static onInterceptorError(messages: Messages, error: string, onFinish?: () => void) {
    messages.addNewErrorMessage('service', error);
    onFinish?.();
  }

  public static simulate(messages: Messages, sh: StreamHandlers, result: ResponseI) {
    const simulationSH = sh as unknown as SimulationSH;
    // reason for not streaming html is because there is no standard way to split it
    if (result.files || result.html) messages.addNewMessage({sendUpdate: false, ignoreText: true, ...result}, false);
    if (result.text) {
      // .filter(Boolean) removes '' entries in the array as they stop the simulation
      const responseText = result.text?.split(' ').filter(Boolean) || [];
      sh.onOpen();
      Stream.populateMessages(responseText, messages, simulationSH);
    }
  }

  // prettier-ignore
  private static populateMessages(responseText: string[],
      messages: Messages, sh: SimulationSH, wordIndex = 0, streamBubble?: HTMLElement) {
    const word = responseText[wordIndex];
    if (word) {
      streamBubble ??= messages.updatedStreamedMessage(streamBubble, {text: `${word} `});
      const timeout = setTimeout(() => {
        Stream.populateMessages(responseText, messages, sh, wordIndex + 1, streamBubble);
      }, sh.simulationInterim || 70);
      sh.abortStream.abort = () => {
        Stream.abort(timeout, messages, sh.onClose);
      };
    } else {
      messages.finaliseStreamedMessage();
      sh.onClose();
    }
  }

  public static isSimulation(stream?: StreamI) {
    return typeof stream === 'object' && !!stream.simulation;
  }

  private static abort(timeout: number, messages: Messages, onClose: () => void) {
    clearTimeout(timeout);
    messages.finaliseStreamedMessage();
    onClose();
  }
}
