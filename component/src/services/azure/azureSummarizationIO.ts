import {AzureSummarizationResult, AzureAuthenticationError} from '../../types/azureResult';
import {DOCS_BASE_URL, ERROR, TEXT} from '../../utils/consts/messageConstants';
import {AZURE_BUILD_SUMMARIZATION_HEADER} from './utils/azureUtils';
import {Azure, AzureSummarizationConfig} from '../../types/azure';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AzureLanguageIO} from './azureLanguageIO';
import {GenericObject} from '../../types/object';
import {GET} from '../utils/serviceConstants';
import {PollResult} from '../serviceIO';
import {DeepChat} from '../../deepChat';

type RawBody = Required<Pick<AzureSummarizationConfig, 'language'>>;

export class AzureSummarizationIO extends AzureLanguageIO {
  private static readonly ENDPOINT_ERROR_MESSAGE =
    // eslint-disable-next-line max-len
    `Please define the azure endpoint. [More Information](${DOCS_BASE_URL}directConnection/Azure#Summarization)`;
  override permittedErrorPrefixes: string[] = [AzureSummarizationIO.ENDPOINT_ERROR_MESSAGE];
  url = '';
  textInputPlaceholderText = 'Insert text to summarize';
  isTextInputDisabled = false;

  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.azure?.summarization as NonNullable<Azure['summarization']>;
    const apiKey = deepChat.directConnection?.azure;
    super(deepChat, AZURE_BUILD_SUMMARIZATION_HEADER, config.endpoint, apiKey);
    if (!config.endpoint) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({[ERROR]: AzureSummarizationIO.ENDPOINT_ERROR_MESSAGE});
      });
    } else {
      this.rawBody.language ??= 'en';
      Object.assign(this.rawBody, config);
      this.url = `${config.endpoint}/language/analyze-text/jobs?api-version=2022-10-01-preview`;
    }
  }

  preprocessBody(body: RawBody, messages: MessageContentI[]) {
    const mostRecentMessageText = messages[messages.length - 1][TEXT];
    if (!mostRecentMessageText) return;
    return {
      analysisInput: {
        documents: [
          {
            id: '1',
            language: body.language,
            [TEXT]: mostRecentMessageText,
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
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
    this.messages = messages;
  }

  override async extractResultData(result: Response & AzureAuthenticationError): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (this.messages && this.completionsHandlers) {
      this.asyncCallInProgress = true;
      const jobURL = result.headers.get('operation-location') as string;
      const requestInit = {method: GET, headers: this.connectSettings?.headers as GenericObject<string>};
      HTTPRequest.executePollRequest(this, jobURL, requestInit, this.messages);
    }
    return {[TEXT]: ''};
  }

  async extractPollResultData(result: AzureSummarizationResult): PollResult {
    if (result[ERROR]) throw result[ERROR];
    if (result.status === 'running' || result.status === 'notStarted') return {timeoutMS: 2000};
    if (result.errors.length > 0) throw result.errors[0];
    if (result.tasks.items[0].results.errors.length > 0) throw result.tasks.items[0].results.errors[0];
    let textResult = '';
    for (const a of result.tasks.items[0].results.documents[0].sentences) {
      textResult += a[TEXT];
    }
    return {[TEXT]: textResult || ''};
  }
}
