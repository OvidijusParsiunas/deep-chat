import {DOCS_BASE_URL} from '../../../utils/consts/messageConstants';
import {ServiceIO} from '../../../services/serviceIO';
import {DeepChat} from '../../../deepChat';

export class SetupMessages {
  public static getText(deepChat: DeepChat, serviceIO: ServiceIO) {
    if (!deepChat.directConnection && !deepChat.connect && !deepChat.webModel && !deepChat.demo) {
      return (
        `Connect to any API using the [connect](${DOCS_BASE_URL}connect#connect-1) ` +
        'property or a popular service via ' +
        `[directConnection](${DOCS_BASE_URL}directConnection/#directConnection).` +
        `\n Host AI entirely on your browser via a [webModel](${DOCS_BASE_URL}webModel).` +
        '\n To get started checkout the [Start](https://deepchat.dev/start) page and ' +
        'live code [examples](https://deepchat.dev/examples/frameworks).' +
        `\n To remove this message set the [demo](${DOCS_BASE_URL}modes#demo) property to true.`
      );
    } else if (deepChat.directConnection) {
      if (!serviceIO.isDirectConnection()) {
        return `Please define a valid service inside
          the [directConnection](${DOCS_BASE_URL}directConnection/#directConnection) object.`;
      }
      const chat = deepChat.directConnection.openAI?.chat;
      if (typeof chat === 'object' && chat.tools?.find((tool) => tool.type === 'function') && !chat.function_handler) {
        return (
          'Please define the `function_handler` property inside' +
          ` the openAI [chat](${DOCS_BASE_URL}directConnection/openAI#Chat) object.`
        );
      }
    } else if (deepChat.connect) {
      // don't forget that when Demo mode is enabled - url is set to 'deep-chat-demo'
      if (!deepChat.connect.url && !deepChat.connect.handler) {
        return (
          'Please define a `url` or a `handler` property inside ' +
          `the [connect](${DOCS_BASE_URL}connect#connect-1) object.`
        );
      }
    }
    return null;
  }
}
