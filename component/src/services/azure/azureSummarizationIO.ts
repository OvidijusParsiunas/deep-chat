import {AzureSummarizationResult, AzureAuthenticationError} from '../../types/azureResult';
import {Azure, AzureSummarizationConfig} from '../../types/azure';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AzureLanguageIO} from './azureLanguageIO';
import {GenericObject} from '../../types/object';
import {AzureUtils} from './utils/azureUtils';
import {PollResult} from '../serviceIO';
import {DeepChat} from '../../deepChat';

type RawBody = Required<Pick<AzureSummarizationConfig, 'language'>>;

export class AzureSummarizationIO extends AzureLanguageIO {
  url = '';
  textInputPlaceholderText = 'Insert text to summarize';
  private messages?: Messages;

  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.azure?.summarization as NonNullable<Azure['summarization']>;
    const apiKey = deepChat.directConnection?.azure;
    super(deepChat, AzureUtils.buildSummarizationHeader, config.endpoint, apiKey);
    this.rawBody.language ??= 'en';
    Object.assign(this.rawBody, config);

    this.url = `${config.endpoint}/language/analyze-text/jobs?api-version=2022-10-01-preview`;
  }

  preprocessBody(body: RawBody, messages: MessageContentI[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {
      analysisInput: {
        documents: [
          {
            id: '1',
            language: body.language,
            text: mostRecentMessageText,
          },
        ],
      },
      tasks: [
        {
          kind: 'ExtractiveSummarization',
        },
      ],
    };
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body as object, messages);
    this.messages = messages;
  }

  override async extractResultData(result: Response & AzureAuthenticationError): Promise<{makingAnotherRequest: true}> {
    if (result.error) throw result.error.message;
    if (this.messages && this.completionsHandlers) {
      const jobURL = result.headers.get('operation-location') as string;
      const requestInit = {method: 'GET', headers: this.connectSettings?.headers as GenericObject<string>};
      HTTPRequest.executePollRequest(this, jobURL, requestInit, this.messages);
    }
    return {makingAnotherRequest: true};
  }

  async extractPollResultData(result: AzureSummarizationResult): PollResult {
    if (result.error) throw result.error;
    if (result.status === 'running') return {timeoutMS: 2000};
    if (result.errors.length > 0) throw result.errors[0];
    if (result.tasks.items[0].results.errors.length > 0) throw result.tasks.items[0].results.errors[0];
    let textResult = '';
    for (const a of result.tasks.items[0].results.documents[0].sentences) {
      textResult += a.text;
    }
    return {text: textResult || ''};
  }
}
