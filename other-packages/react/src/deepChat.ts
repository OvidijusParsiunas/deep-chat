import {DeepChat as DeepChatCore} from 'deep-chat';
import {createComponent} from '@lit/react';
import * as React from 'react';

// This may not be required in React 19
// https://www.reddit.com/r/reactjs/comments/1h88njm/react_19_introduces_full_support_for_custom/
export const DeepChat = createComponent({
  tagName: 'deep-chat',
  elementClass: DeepChatCore,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});
