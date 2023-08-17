function toggleNavShadowOnScroll(navBar) {
  if (window.scrollY > 0) {
    navBar.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 10%)';
  } else {
    navBar.style.boxShadow = 'unset';
  }
}

// probably not the best way of toggling the scrollbar, but did not want to spend more time to override docusaurus API
// refactoring to this is welcome
export function readdAutoNavShadowToggle() {
  setTimeout(() => {
    window.removeEventListener('scroll', window.toggleNavOnScroll);
    const navBars = document.getElementsByClassName('navbar--fixed-top');
    if (navBars[0]) {
      const navbar = navBars[0];
      toggleNavShadowOnScroll(navbar);
      window.toggleNavOnScroll = toggleNavShadowOnScroll.bind(this, navbar);
      window.addEventListener('scroll', window.toggleNavOnScroll);
    }
  }, 2);
}

export function fadeIn() {
  setTimeout(() => {
    const element = document.querySelectorAll('.homepage > body > #__docusaurus > nav')?.[0];
    try {
      element.classList.add('fade-in');
    } catch (e) {
      console.error(e);
      console.log('element was not rendered in time - use MutationObserver');
    }
  }, 2);
}

// export function observeForElement() {
//   const targetElement = document.querySelector('.homepage > body > #__docusaurus > nav');

//   if (!targetElement) {
//     // If the target element is not found, we create a new MutationObserver
//     // to watch for changes in the DOM and detect when the element is added.
//     const observer = new MutationObserver((mutationsList, observer) => {
//       for (const mutation of mutationsList) {
//         // We check each added node to see if it's the target element.
//         for (const node of mutation.addedNodes) {
//           if (node instanceof HTMLElement && node.matches('.homepage > body > #__docusaurus > nav')) {
//             // We've found the target element, so we stop observing and return it.
//             observer.disconnect();
//             console.log('found later');
//             return node;
//           }
//         }
//       }
//     });

//     // We start observing the document for changes.
//     observer.observe(document, {childList: true, subtree: true});
//   } else {
//     console.log('immediately found');
//     // If the target element is found, we simply return it.
//     return targetElement;
//   }
// }
