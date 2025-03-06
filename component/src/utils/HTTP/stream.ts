import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {MessageStream} from '../../views/chat/messages/stream/messageStream';
import {ServiceIO, StreamHandlers} from '../../services/serviceIO';
import {HTMLUtils} from '../../views/chat/messages/html/htmlUtils';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {Stream as StreamI} from '../../types/stream';
import {CustomHandler} from './customHandler';
import {RequestUtils} from './requestUtils';
import {Demo} from '../demo/demo';

type SimulationSH = Omit<StreamHandlers, 'abortStream'> & {abortStream: {abort: () => void}};

type UpsertFunc = (response?: ResponseI) => MessageStream | void;

export class Stream {
  // prettier-ignore
  public static async request(io: ServiceIO, body: object, messages: Messages, stringifyBody = true, canBeEmpty = false) {
    const requestDetails = {body, headers: io.connectSettings?.headers};
    const {body: interceptedBody, headers: interceptedHeaders, error} =
      (await RequestUtils.processRequestInterceptor(io.deepChat, requestDetails));
    const {onOpen, onClose, abortStream} = io.streamHandlers;
    if (error) return RequestUtils.onInterceptorError(messages, error, onClose);
    if (io.connectSettings?.handler) return CustomHandler.stream(io, interceptedBody, messages);
    if (io.connectSettings?.url === Demo.URL) return Demo.requestStream(messages, io);
    const stream = new MessageStream(messages);
    const fetchFunc = RequestUtils.fetch.bind(this, io, interceptedHeaders, stringifyBody);
    fetchEventSource(io.connectSettings?.url || io.url || '', {
      method: io.connectSettings?.method || 'POST',
      headers: interceptedHeaders,
      credentials: io.connectSettings?.credentials,
      body: stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody,
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          return onOpen();
        }
        const result = await RequestUtils.processResponseByType(response);
        throw result;
      },
      async onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          let eventData: object;
          try {
            eventData = JSON.parse(message.data);
          } catch (_) {
            eventData = {};
          }
          const finalEventData = (await io.deepChat.responseInterceptor?.(eventData)) || eventData;
          io.extractResultData?.(finalEventData, fetchFunc, interceptedBody)
            .then((result?: ResponseI) => {
              // when async call is happening - an event with text signals its over
              if (io.asyncCallInProgress && result && result.text !== '') {
                Stream.simulate(messages, io.streamHandlers, result);
                onClose();
                io.asyncCallInProgress = false;
              } else {
                // do not to stop the stream on one message failure to give other messages a change to display
                Stream.upsertWFiles(messages, stream.upsertStreamedMessage.bind(stream), stream, result);
              }
            })
            .catch((e) => RequestUtils.displayError(messages, e));
        }
      },
      onerror(err) {
        onClose();
        throw err; // need to throw otherwise stream will retry infinitely
      },
      onclose() {
        if (io.asyncCallInProgress) return;
        try {
          stream.finaliseStreamedMessage();
          onClose();
        } catch (e) {
          if (!canBeEmpty) throw e;
        }
      },
      signal: abortStream.signal,
    }).catch((err) => {
      if (messages.isLastMessageError()) return;
      // allowing extractResultData to attempt extract error message and throw it
      io.extractResultData?.(err)
        .then(() => {
          RequestUtils.displayError(messages, err);
        })
        .catch((parsedError) => {
          RequestUtils.displayError(messages, parsedError);
        });
    });
    return stream;
  }

  // io is only passed for demo to simulate a real stream
  public static async simulate(messages: Messages, sh: StreamHandlers, result: ResponseI, io?: ServiceIO) {
    const simulationSH = sh as unknown as SimulationSH;
    if (!(await RequestUtils.basicResponseProcessing(messages, result, {io, useRI: false}))) return sh.onClose();
    if (Array.isArray(result)) result = result[0]; // single array responses are supproted
    if (result.files) {
      const finalEventData = await RequestUtils.basicResponseProcessing(messages, {files: result.files}, {io});
      messages.addNewMessage({sendUpdate: false, ignoreText: true, ...finalEventData}, false);
    }
    if (result.text) {
      sh.onOpen();
      const responseTextStrings = result.text.split(''); // important to split by char for Chinese characters
      Stream.populateMessages(messages, responseTextStrings, new MessageStream(messages), simulationSH, 'text', 0, io);
    }
    if (result.html) {
      sh.onOpen();
      let responseHTMLStrings = HTMLUtils.splitHTML(result.html);
      if (responseHTMLStrings.length === 0) responseHTMLStrings = result.html.split('');
      Stream.populateMessages(messages, responseHTMLStrings, new MessageStream(messages), simulationSH, 'html', 0, io);
    }
  }

  // prettier-ignore
  // io is only passed for demo to simulate a real stream
  private static async populateMessages(messages: Messages, responseStrings: string[], stream: MessageStream,
      sh: SimulationSH, type: 'text'|'html', charIndex: number, io?: ServiceIO) {
    const character = responseStrings[charIndex];
    if (character) {
      const finalEventData = await RequestUtils.basicResponseProcessing(messages, {[type]: character}, {io});
      Stream.upsertWFiles(messages, stream.upsertStreamedMessage.bind(stream), stream, finalEventData);
      const timeout = setTimeout(() => {
        Stream.populateMessages(messages, responseStrings, stream, sh, type, charIndex + 1, io);
      }, sh.simulationInterim || 6);
      sh.abortStream.abort = () => {
        Stream.abort(timeout, stream, sh.onClose);
      };
    } else {
      stream.finaliseStreamedMessage();
      sh.onClose();
    }
  }

  public static isSimulation(stream?: StreamI) {
    return typeof stream === 'object' && !!stream.simulation;
  }

  public static isSimulatable(stream?: StreamI, respone?: ResponseI) {
    return Stream.isSimulation(stream) && respone && (respone.text || respone.html);
  }

  private static abort(timeout: number, stream: MessageStream, onClose: () => void) {
    clearTimeout(timeout);
    stream.finaliseStreamedMessage();
    onClose();
  }

  public static upsertWFiles(msgs: Messages, upsert: UpsertFunc, stream?: MessageStream, resp?: ResponseI | ResponseI[]) {
    if (resp && Array.isArray(resp)) resp = resp[0]; // single array responses are supproted
    if (resp?.text || resp?.html) {
      const resultStream = upsert(resp);
      stream ??= resultStream || undefined; // when streaming with websockets - created per message due to roles
    }
    if (resp?.files) {
      msgs.addNewMessage({files: resp.files});
      stream?.markFileAdded();
    }
  }
}
