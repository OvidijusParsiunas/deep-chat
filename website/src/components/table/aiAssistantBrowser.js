import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

// Used to allow client side rendering
export default function AiAssistantBrowser(props) {
  return (
    <BrowserOnly>
      {() => {
        const AiAssistant = require('ai-assistant-react').AiAssistant;
        return <AiAssistant {...props}></AiAssistant>;
      }}
    </BrowserOnly>
  );
}
