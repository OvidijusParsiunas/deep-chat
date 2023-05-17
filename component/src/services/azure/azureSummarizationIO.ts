import {AzureSummarizationResult} from '../../types/azureResult';
import {Azure, AzureSummarizationConfig} from '../../types/azure';
import {CompletionsHandlers, PollResult} from '../serviceIO';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {AzureLanguageIO} from './azureLanguageIO';
import {GenericObject} from '../../types/object';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';

type RawBody = Required<Pick<AzureSummarizationConfig, 'language'>>;

export class AzureSummarizationIO extends AzureLanguageIO {
  url = '';
  textInputPlaceholderText = 'Insert text to summarize';
  private messages?: Messages;
  private completionsHandlers?: CompletionsHandlers;
  private readonly _raw_body: RawBody = {language: 'en'};

  constructor(aiAssistant: AiAssistant) {
    const {service} = aiAssistant;
    const config = service?.azure?.summarization as NonNullable<Azure['summarization']>;
    super(aiAssistant, AzureUtils.buildSummarizationHeader, config);
    Object.assign(this._raw_body, config);
    this.url = `${config.endpoint}/language/analyze-text/jobs?api-version=2022-10-01-preview`;
  }

  preprocessBody(body: RawBody, messages: MessageContent[]) {
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

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    HTTPRequest.request(this, body as object, messages, completionsHandlers.onFinish);
    this.messages = messages;
    this.completionsHandlers = completionsHandlers;
  }

  async extractResultData(result: Response): Promise<{pollingInAnotherRequest: true}> {
    if (this.messages && this.completionsHandlers) {
      const jobURL = result.headers.get('operation-location') as string;
      const requestInit = {method: 'GET', headers: this.requestSettings?.headers as GenericObject<string>};
      HTTPRequest.executePollRequest(this, jobURL, requestInit, this.messages, this.completionsHandlers.onFinish);
    }
    return {pollingInAnotherRequest: true};
  }

  async extractPollResultData(result: AzureSummarizationResult): PollResult {
    if (result.error) throw result.error;
    if (result.status === 'running') return {timeoutMS: 2000};
    if (result.errors.length > 0) throw result.errors[0];
    if (result.tasks.items[0].results.errors.length > 0) throw result.tasks.items[0].results.errors[0];
    return {text: result.tasks.items[0].results.documents[0].sentences[0]?.text || ''};
  }
}
