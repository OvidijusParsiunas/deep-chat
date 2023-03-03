import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {OpenAIClientIO} from './clientIO/openAIClientIO';
import {OpenAIResult} from '../../types/openAIResult';
import {OpenAICompletions} from '../../types/openAI';

// WORK - need error handling for both
export class OpenAIClient {
  private static readonly _models_url = 'https://api.openai.com/v1/models';

  private static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  public static requestCompletion(io: OpenAIClientIO, params: OpenAICompletions, key: string,
      messages: Messages, onSuccessfulResult: () => void) {
    fetch(io.url, {
      method: 'POST',
      headers: new Headers(OpenAIClient.buildHeaders(key)),
      body: io.buildBody(params, messages),
    })
      .then((response) => response.json())
      .then((result: OpenAIResult) => {
        const text = io.extractTextFromResult(result);
        messages.addNewMessage(text, true);
        onSuccessfulResult();
      })
      .catch((err) => console.error(err));
  }

  // prettier-ignore
  public static requestStreamCompletion(io: OpenAIClientIO, params: OpenAICompletions, key: string,
      messages: Messages, onOpen: () => void, onClose: () => void, abortStream: AbortController) {
    let textElement: HTMLElement | null = null;
    fetchEventSource(io.url, {
      method: 'POST',
      headers: OpenAIClient.buildHeaders(key),
      body: io.buildBody(params, messages),
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          textElement = messages.addNewStreamedMessage();
          return onOpen();
        }
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
        throw new Error('error'); // need to throw otherwise stream will retry infinitely
      },
      onclose() {
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
