import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

export default function FadeInContent({contentRef}) {
  return (
    <BrowserOnly>
      {() => {
        // REF-39 - code synchronous
        require('deep-chat-react');
        // in a timeout as moving back to the homepage from a different tab has the page ref 'current' as null
        setTimeout(() => {
          if (contentRef?.current) contentRef.current.className = 'fade-in';
        }, 300);
      }}
    </BrowserOnly>
  );
}
