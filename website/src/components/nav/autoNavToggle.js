function toggleNavOnScroll(navBar) {
  if (window.scrollY > 0) {
    navBar.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 10%)';
  } else {
    navBar.style.boxShadow = 'unset';
  }
}

// probably not the best way of toggling the scrollbar, but did not want to spend more time to override docusaurus API
// refactoring to this is welcome
export function readdAutoNavToggle() {
  setTimeout(() => {
    window.removeEventListener('scroll', window.toggleNavOnScroll);
    const navBars = document.getElementsByClassName('navbar--fixed-top');
    if (navBars[0]) {
      const navbar = navBars[0];
      toggleNavOnScroll(navbar);
      window.toggleNavOnScroll = toggleNavOnScroll.bind(this, navbar);
      window.addEventListener('scroll', window.toggleNavOnScroll);
    }
  }, 2);
}

export function fadeIn() {
  setTimeout(() => {
    const element = document.querySelectorAll('.plugin-pages > body > #__docusaurus > nav')?.[0];
    if (element) element.classList.add('fade-in');
  }, 2);
}
