import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

export default function FadeInContent({contentRef}) {
  return (
    <BrowserOnly>
      {() => {
        try {
          // REF-39 - code synchronous
          require('deep-chat-react');
          // in a timeout as moving back to the homepage from a different tab has the page ref 'current' as null
          setTimeout(() => {
            if (contentRef?.current) contentRef.current.className = 'fade-in';
          }, 50); // setting 50 as I got a hanging white-screen on website loadup - but not sure if this was the cause
        } catch (e) {
          console.error(e);
        }
      }}
    </BrowserOnly>
  );
}
