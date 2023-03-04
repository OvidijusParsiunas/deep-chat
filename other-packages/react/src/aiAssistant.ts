import {AiAssistant as AiAssistantCore} from 'ai-assistant';
import {createComponent} from '@lit-labs/react';
import * as React from 'react';

export const AiAssistant = createComponent({
  tagName: 'ai-assistant',
  elementClass: AiAssistantCore,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});
