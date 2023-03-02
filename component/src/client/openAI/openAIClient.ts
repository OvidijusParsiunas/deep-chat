import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {OpenAICompletions, OpenAIMessage} from '../../types/openAI';
import {OpenAIInternalParams} from '../../types/openAIInternal';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {OpenAIResult} from '../../types/openAIResult';

// WORK - need error handling for both
export class OpenAIClient {
  private static readonly _completions_url = 'https://api.openai.com/v1/completions';
  private static readonly _chat_url = 'https://api.openai.com/v1/chat/completions'; // chat is a form of completions
  private static readonly _models_url = 'https://api.openai.com/v1/models';

  private static buildCompletionsHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  private static extractTextFromResult(result: OpenAIResult) {
    const choice = result.choices[0];
    if (choice.message) {
      return choice.message.content;
    }
    return choice.text;
  }

  private static buildCompletionsBody(params: OpenAIInternalParams, prompt: string) {
    return JSON.stringify({prompt, ...params});
  }

  private static buildChatBody(params: OpenAIInternalParams, messagesObj: Messages) {
    const body = JSON.parse(JSON.stringify(params)) as OpenAIInternalParams;
    const messages: OpenAIMessage[] = messagesObj.messages.map((message) => {
      return {content: message.text, role: message.role === 'ai' ? 'assistant' : message.role};
    });
    if (body.messages) {
      body.messages.push(...messages);
    } else {
      body.messages = messages;
    }
    return JSON.stringify(body);
  }

  private static isChat(params: OpenAIInternalParams) {
    return params.messages;
  }

  private static getBody(params: OpenAIInternalParams, prompt: string, messages: Messages) {
    return OpenAIClient.isChat(params)
      ? OpenAIClient.buildChatBody(params, messages)
      : OpenAIClient.buildCompletionsBody(params, prompt);
  }

  private static getUrl(params: OpenAIInternalParams) {
    return OpenAIClient.isChat(params) ? OpenAIClient._chat_url : OpenAIClient._completions_url;
  }

  // prettier-ignore
  public static requestCompletion(params: OpenAICompletions, key: string, prompt: string,
      messages: Messages, onSuccessfulResult: () => void) {
    fetch(OpenAIClient.getUrl(params), {
      method: 'POST',
      headers: new Headers(OpenAIClient.buildCompletionsHeaders(key)),
      body: OpenAIClient.getBody(params, prompt, messages),
    })
      .then((response) => response.json())
      .then((result: OpenAIResult) => {
        const text = OpenAIClient.extractTextFromResult(result);
        messages.addNewMessage(text, true);
        onSuccessfulResult();
      })
      .catch((err) => console.error(err));
  }

  // prettier-ignore
  public static requestStreamCompletion(params: OpenAICompletions, key: string, prompt: string, messages: Messages,
      onOpen: () => void, onClose: () => void, abortStream: AbortController) {
    let textElement: HTMLElement | null = null;
    fetchEventSource(OpenAIClient.getUrl(params), {
      method: 'POST',
      headers: OpenAIClient.buildCompletionsHeaders(key),
      body: OpenAIClient.getBody(params, prompt, messages),
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
          const text = OpenAIClient.extractTextFromResult(response);
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
      headers: new Headers(OpenAIClient.buildCompletionsHeaders(inputElement.value.trim())),
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
