import {ServiceIO} from '../../../services/serviceIO';
import {DeepChat} from '../../../deepChat';
import {Messages} from './messages';

export class GuidanceMessages {
  private static getText(deepChat: DeepChat, serviceIO: ServiceIO) {
    if (!deepChat.directConnection && !deepChat.request) {
      return `Connect to any API using the [request](https://deepchat.dev/docs/connect#Request)
        property or choose any one of the preconfigured APIs via
        the [directConnection](https://deepchat.dev/docs/directConnection/#directConnection) property.
        \n To get stared checkout the [Start](https://deepchat.dev/start) page and
        live code [examples](https://deepchat.dev/examples/frameworks).`;
    } else if (deepChat.directConnection) {
      if (!serviceIO.isDirectConnection()) {
        return `Please define a valid service inside
          the [directConnection](https://deepchat.dev/docs/directConnection/#directConnection) object.`;
      }
    } else if (deepChat.request) {
      if (!deepChat.request.url && !deepChat.request.handler) {
        return (
          'Please define a `url` or a `handler` property inside ' +
          'the [request](https://deepchat.dev/docs/connect#Request) object.'
        );
      }
    }
    return null;
  }

  public static addSetupMessageIfNeeded(messages: Messages, deepChat: DeepChat, serviceIO: ServiceIO) {
    const text = GuidanceMessages.getText(deepChat, serviceIO);
    if (text) messages.addNewMessage({text}, true, true, true);
  }
}
