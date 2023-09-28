import {ServiceIO} from '../../../services/serviceIO';
import {DeepChat} from '../../../deepChat';

export class SetupMessages {
  public static getText(deepChat: DeepChat, serviceIO: ServiceIO) {
    if (!deepChat.directConnection && !deepChat.request && !deepChat.demo) {
      return `Connect to any API using the [request](https://deepchat.dev/docs/connect#Request)
        property or choose any one of the preconfigured APIs via
        the [directConnection](https://deepchat.dev/docs/directConnection/#directConnection) property.
        \n To get started checkout the [Start](https://deepchat.dev/start) page and
        live code [examples](https://deepchat.dev/examples/frameworks).
        \n To remove this message set the [demo](https://deepchat.dev/docs/demo#demo) property to true.`;
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
}
