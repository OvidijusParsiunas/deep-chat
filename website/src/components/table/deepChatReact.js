import {DeepChat as DeepChatCore} from 'deep-chat';
import {createComponent} from '@lit-labs/react';
import * as React from 'react';

export const DeepChatReact = createComponent({
  tagName: 'deep-chat',
  elementClass: DeepChatCore,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});
