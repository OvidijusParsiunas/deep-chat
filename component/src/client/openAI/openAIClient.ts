import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {OpenAIClientIO} from './clientIO/openAIClientIO';
import {OpenAIResult} from '../../types/openAIResult';
import {OpenAICompletions} from '../../types/openAI';

export class OpenAIClient {
  private static readonly _models_url = 'https://api.openai.com/v1/models';

  private static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  public static requestCompletion(io: OpenAIClientIO, baseBody: OpenAICompletions, key: string,
      customRequestSettings: RequestSettings | undefined, messages: Messages, requestInterceptor: RequestInterceptor,
      onFinish: () => void) {
    fetch(customRequestSettings?.url || io.url, {
      method: customRequestSettings?.method || 'POST',
      headers: customRequestSettings?.headers || new Headers(OpenAIClient.buildHeaders(key)),
      body: JSON.stringify(requestInterceptor(io.buildBody(baseBody, messages))),
    })
      .then((response) => response.json())
      .then((result: OpenAIResult) => {
        const text = io.extractTextFromResult(result);
        messages.addNewMessage(text, true);
        onFinish();
      })
      .catch((err) => {
        console.error(err);
        messages.addNewErrorMessage('chat');
        onFinish();
      });
  }

  // prettier-ignore
  public static requestStreamCompletion(io: OpenAIClientIO, baseBody: OpenAICompletions, key: string,
      customRequestSettings: RequestSettings | undefined, messages: Messages, requestInterceptor: RequestInterceptor,
      onOpen: () => void, onClose: () => void, abortStream: AbortController) {
    let textElement: HTMLElement | null = null;
    fetchEventSource(customRequestSettings?.url || io.url, {
      method: customRequestSettings?.method || 'POST',
      headers: customRequestSettings?.headers || OpenAIClient.buildHeaders(key),
      body: JSON.stringify(requestInterceptor(io.buildBody(baseBody, messages))),
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          textElement = messages.addNewStreamedMessage();
          return onOpen();
        }
        messages.addNewErrorMessage('chat');
        onClose();
        throw new Error('error');
      },
      onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          const response = JSON.parse(message.data) as unknown as OpenAIResult;
          const text = io.extractTextFromResult(response);
          if (textElement) Messages.updateStreamedMessage(text, textElement);
        }
      },
      onerror(err) {
        console.error(err);
        messages.addNewErrorMessage('chat');
        onClose();
        throw new Error('error'); // need to throw otherwise stream will retry infinitely
      },
      onclose() {
        messages.finaliseStreamedMessage((textElement as HTMLElement)?.innerText);
        onClose();
      },
      signal: abortStream.signal,
    });
  }

  // prettier-ignore
  public static verifyKey(inputElement: HTMLInputElement,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void) {
    const key = inputElement.value.trim();
    if (key === '') return onFail(ErrorMessages.INVALID_KEY);
    onLoad();
    fetch(OpenAIClient._models_url, {
      method: 'GET',
      headers: new Headers(OpenAIClient.buildHeaders(inputElement.value.trim())),
      body: null,
    })
      .then((response) => response.json())
      .then((result: OpenAIResult) => {
        if (result.error) {
          if (result.error.code === 'invalid_api_key') {
            onFail(ErrorMessages.INVALID_KEY);
          } else {
            onFail(ErrorMessages.CONNECTION_FAILED);
          }
        } else {
          onSuccess(key);
        }
      })
      .catch((err) => {
        onFail(ErrorMessages.CONNECTION_FAILED);
        console.error(err);
      });
  }
}
