import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

export default function FadeInNav() {
  return (
    <BrowserOnly>
      {() => {
        try {
          // REF-39
          const navToggle = require('@site/src/components/nav/autoNavToggle');
          setTimeout(() => {
            const navbar = document.querySelector('.homepage > body > #__docusaurus > nav');
            // because the selector is used to set opacity 0 at the start - its opacity takes over
            // after the fade-in animation is finished - hence we manually set it here
            if (navbar) navbar.style.opacity = '1';
          }, 1800);
          navToggle.fadeIn();
          navToggle.readdAutoNavShadowToggle();
        } catch (e) {
          console.error(e);
        }
      }}
    </BrowserOnly>
  );
}
