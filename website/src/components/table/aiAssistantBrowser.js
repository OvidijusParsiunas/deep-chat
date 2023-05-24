import {AiAssistantReact} from './aiAssistantReact';
import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

// Used to allow client side rendering
export default function AiAssistantBrowser(props) {
  return (
    <BrowserOnly>
      {() => {
        return <AiAssistantReact {...props}>{props.children}</AiAssistantReact>;
      }}
    </BrowserOnly>
  );
}
