import {ServiceIO} from '../../../services/serviceIO';
import {DeepChat} from '../../../deepChat';

export class SetupMessages {
  public static getText(deepChat: DeepChat, serviceIO: ServiceIO) {
    if (!deepChat.directConnection && !deepChat.connect && !deepChat.webModel && !deepChat.demo) {
      return (
        'Connect to any API using the [connect](https://deepchat.dev/docs/connect#connect-1) ' +
        'property or a popular service via ' +
        '[directConnection](https://deepchat.dev/docs/directConnection/#directConnection).' +
        '\n Host AI entirely on your browser via a [webModel](https://deepchat.dev/docs/webModel).' +
        '\n To get started checkout the [Start](https://deepchat.dev/start) page and ' +
        'live code [examples](https://deepchat.dev/examples/frameworks).' +
        '\n To remove this message set the [demo](https://deepchat.dev/docs/demo#demo) property to true.'
      );
    } else if (deepChat.directConnection) {
      if (!serviceIO.isDirectConnection()) {
        return `Please define a valid service inside
          the [directConnection](https://deepchat.dev/docs/directConnection/#directConnection) object.`;
      }
      const openAIChat = deepChat.directConnection.openAI?.chat;
      if (typeof openAIChat === 'object' && openAIChat.tools && !openAIChat.function_handler) {
        return (
          'Please define the `function_handler` property inside' +
          ' the openAI [chat](https://deepchat.dev/docs/directConnection/openAI#Chat) object.'
        );
      }
    } else if (deepChat.connect) {
      // don't forget that when Demo mode is enabled - url is set to 'deep-chat-demo'
      if (!deepChat.connect.url && !deepChat.connect.handler) {
        if (deepChat.demo) {
          if (!deepChat.connect.stream) {
            return (
              'When [demo](https://deepchat.dev/docs/demo) mode is enabled - ' +
              'the [connect](https://deepchat.dev/docs/connect#connect-1) ' +
              'object can only accept the [stream](https://deepchat.dev/docs/connect#Stream) property.'
            );
          }
          return null;
        }
        return (
          'Please define a `url` or a `handler` property inside ' +
          'the [connect](https://deepchat.dev/docs/connect#connect-1) object.'
        );
      }
    }
    return null;
  }
}
