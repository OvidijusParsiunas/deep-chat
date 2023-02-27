import {CompletionResult} from '../../../../types/openAIResult';
import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {Messages} from '../../messages/messages';

export class OpenAIClient {
  private static readonly _completions_url = 'https://api.openai.com/v1/completions';

  private static buildCompletionsHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  private static buildCompletionsBody(prompt: string, stream = true) {
    return JSON.stringify({
      // text-davinci-003
      model: 'text-curie-001',
      prompt,
      temperature: 0.9,
      max_tokens: 20,
      stream,
    });
  }

  public static requestCompletion(key: string, prompt: string, messages: Messages, onSuccessfulResult: () => void) {
    fetch(OpenAIClient._completions_url, {
      method: 'POST',
      headers: new Headers(OpenAIClient.buildCompletionsHeaders(key)),
      body: OpenAIClient.buildCompletionsBody(prompt),
    })
      .then((response) => response.json())
      .then((result: CompletionResult) => {
        const text = result.choices[0].text;
        messages.addNewMessage(text, true);
        onSuccessfulResult();
      })
      .catch((err) => console.error(err));
  }

  // prettier-ignore
  public static requestStreamCompletion(key: string, prompt: string, messages: Messages,
      onOpen: () => void, onClose: () => void, abortStream: AbortController) {
    const textElement = messages.addNewStreamedMessage();
    fetchEventSource(OpenAIClient._completions_url, {
      method: 'POST',
      headers: OpenAIClient.buildCompletionsHeaders(key),
      body: OpenAIClient.buildCompletionsBody(prompt, true),
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          return onOpen();
        }
        throw new Error('error');
      },
      onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          const response = JSON.parse(message.data) as unknown as CompletionResult;
          const text = response.choices[0].text;
          Messages.updateStreamedMessage(text, textElement);
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
}
