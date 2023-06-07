import BrowserOnly from '@docusaurus/BrowserOnly';
import {DeepChatReact} from './deepChatReact';
import React from 'react';

// Used to allow client side rendering
export default function DeepChatBrowser(props) {
  return (
    <BrowserOnly>
      {() => {
        return <DeepChatReact {...props}>{props.children}</DeepChatReact>;
      }}
    </BrowserOnly>
  );
}
