import {CustomStyle} from '../../types/styles';
import {DeepChat} from '../../deepChat';

interface LegacyDeepChat {
  containerStyle: CustomStyle;
}

export class Legacy {
  public static checkForContainerStyles(deepChat: DeepChat, containerRef: HTMLElement) {
    const containerStyle = (deepChat as unknown as LegacyDeepChat).containerStyle;
    if (containerStyle) {
      Object.assign(containerRef.style, containerStyle);
      console.error('The containerStyle property is deprecated since version 1.3.14.');
      console.error('Please change to using the style property instead: https://deepchat.dev/docs/styles#style');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static handleResponseProperty(result: any | Response) {
    console.error('The {result: ....} response object type is deprecated since version 1.3.0.');
    console.error('Please change to using the new response object: https://deepchat.dev/docs/connect#Response');
    return result.result;
  }
}
