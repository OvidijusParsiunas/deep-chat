import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

// Used to allow client side rendering
export default function DeepChatBrowser(props) {
  return (
    <BrowserOnly>
      {() => {
        const DeepChatReact = require('deep-chat-react').DeepChat;
        return <DeepChatReact {...props}>{props.children}</DeepChatReact>;
      }}
    </BrowserOnly>
  );
}
