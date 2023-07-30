import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';

// This is an optimization approach to preload the font to not have component text change when it is visible
export default function PreloadFont() {
  return (
    <BrowserOnly>
      {() => {
        const head = document.getElementsByTagName('head')[0];
        const linkExists = Array.from(head.getElementsByTagName('link')).some(
          (link) => link.getAttribute('href') === FONT_URL
        );
        if (!linkExists) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = FONT_URL;
          head.appendChild(link);
        }
      }}
    </BrowserOnly>
  );
}
