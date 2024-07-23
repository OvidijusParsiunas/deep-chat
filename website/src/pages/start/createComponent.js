import vanillaJSLogo from '/img/vanillaJSLogo.png';
import angularLogo from '/img/angularLogo.png';
import svelteLogo from '/img/svelteLogo.png';
import reactLogo from '/img/reactLogo.png';
import solidLogo from '/img/solidLogo.png';
import nextLogo from '/img/nextLogo.png';
import nuxtLogo from '/img/nuxtLogo.png';
import vueLogo from '/img/vueLogo.png';
import './createComponent.css';
import React from 'react';

// not in a utility file as docusaurus reads it as a page
function navigate(setAllowPointerEvents, setFadeOutContent, setInitialDisplay, setOptionNumber, number) {
  setAllowPointerEvents(false);
  setFadeOutContent(true);
  setTimeout(() => {
    setInitialDisplay(false);
    setTimeout(() => {
      setOptionNumber(number);
    }, 900);
  }, 700);
}

function Logos(props) {
  return (
    <div
      className={`start-page-logos ${props.displayLogos ? 'start-page-display-logos' : ''} ${
        props.itemsHoverable ? 'start-page-hoverable-logos' : ''
      }`}
    >
      <div className="start-page-logo start-panel-logo">
        <a href="https://stackblitz.com/edit/deep-chat-react?file=src%2FApp.tsx" target="_blank">
          <img src={reactLogo} width="41" style={{paddingTop: 10}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/examples/frameworks/#vue" target="_blank">
          <img src={vueLogo} width="38" style={{paddingTop: 10}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/examples/frameworks#svelte" target="_blank">
          <img src={svelteLogo} width="32" style={{paddingTop: 8}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://stackblitz.com/edit/stackblitz-starters-7gygrp?file=src%2Fapp%2Fapp.component.ts" target="_blank">
          <img src={angularLogo} width="50" style={{paddingTop: 1}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://stackblitz.com/edit/deep-chat-solid?file=src%2FApp.tsx" target="_blank">
          <img src={solidLogo} width="40" style={{paddingTop: 8}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/nextjs" target="_blank">
          <img src={nextLogo} width="37" style={{paddingTop: 9}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://stackblitz.com/edit/nuxt-starter-vwz6pg?file=app.vue" target="_blank">
          <img src={nuxtLogo} width="37" style={{paddingTop: 9}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://codesandbox.io/s/deep-chat-vanillajs-v2ywnv?file=/index.html" target="_blank">
          <img src={vanillaJSLogo} width="35" style={{paddingTop: 10, borderRadius: 4}} />
        </a>
      </div>
    </div>
  );
}

export default function CreateComponent(props) {
  const [initialDisplay, setInitialDisplay] = React.useState(false);
  const [allowPointerEvents, setAllowPointerEvents] = React.useState(false);
  const [displayInstall, setDisplayInstall] = React.useState(false);
  const [displayDefineMarkup, setDisplayDefineMarkup] = React.useState(false);
  const [displayDone, setDisplayDone] = React.useState(false);
  const [displayExamplesTitle, setDisplayExamplesTitle] = React.useState(false);
  const [displayLogos, setDisplayLogos] = React.useState(false);
  const [itemsHoverable, setItemsHoverable] = React.useState(false);
  const [displayNavigation, setDisplayNavigation] = React.useState(false);
  const [fadeOutContent, setFadeOutContent] = React.useState(false);

  React.useEffect(() => {
    const mountedState = {isMounted: true};
    startAnimation(mountedState);
    return () => {
      mountedState.isMounted = false;
    };
  }, []);

  // prettier-ignore
  const startAnimation = (mountedState) => {
      customTimeout(() => {
        setInitialDisplay(true);
        customTimeout(() => {
          setAllowPointerEvents(true);
          setDisplayInstall(true);
          customTimeout(() => {
            setDisplayDefineMarkup(true);
            customTimeout(() => {
              setDisplayDone(true);
              customTimeout(() => {
                setDisplayExamplesTitle(true);
                customTimeout(() => {
                  setDisplayLogos(true);
                  customTimeout(() => {
                    customTimeout(() => {
                      setDisplayNavigation(true);
                      customTimeout(() => {
                        setItemsHoverable(true);
                      }, 300, mountedState);
                    }, 500, mountedState);
                  }, 1000, mountedState);
                }, 800, mountedState);
              }, 2400, mountedState);
            }, 1800, mountedState);
          }, 1600, mountedState);
        }, 1400, mountedState);
      }, 100, mountedState);
    }

  function customTimeout(displayFunc, ms, mountedState) {
    setTimeout(() => {
      if (!mountedState.isMounted) return;
      displayFunc();
    }, ms);
  }

  return (
    <div
      id="start-page-create-component"
      className={`start-page-main-details ${initialDisplay ? 'start-page-main-details-expanded' : ''} ${
        fadeOutContent ? 'start-page-main-details-fade-out' : ''
      } ${allowPointerEvents ? 'start-page-main-pointer-events' : 'start-page-main-no-pointer-events'}`}
    >
      <div className={`start-page-text start-page-large-text ${displayInstall ? 'start-page-main-details-visible' : ''}`}>
        1. Install
      </div>
      <div className={`start-page-text start-page-small-text ${displayInstall ? 'start-page-main-details-visible' : ''}`}>
        Add the component via an{' '}
        <a href="https://deepchat.dev/docs/installation" target="_blank">
          npm
        </a>{' '}
        dependency or a{' '}
        <a href="https://deepchat.dev/docs/installation" target="_blank">
          script
        </a>
        .
      </div>
      <div className={`start-page-text ${displayDefineMarkup ? 'start-page-main-details-visible' : ''}`}>
        2. Define it in your markup
      </div>
      <div
        className={`start-page-text start-page-small-text start-page-code ${
          displayDefineMarkup ? 'start-page-main-details-visible' : ''
        }`}
      >
        {`<deep-chat></deep-chat>`}
      </div>
      <div className={`start-page-text ${displayDone ? 'start-page-main-details-visible' : ''}`}>All done!</div>
      <div className={`start-page-text ${displayExamplesTitle ? 'start-page-main-details-visible' : ''}`}>
        Live code examples:
      </div>
      <Logos displayLogos={displayLogos} itemsHoverable={itemsHoverable}></Logos>
      <div
        id="start-page-create-component-next"
        className={`start-page-text start-page-navigation ${displayNavigation ? 'start-page-main-details-visible' : ''} ${
          itemsHoverable ? 'start-page-navigation-hoverable' : ''
        }`}
        onClick={() => navigate(setAllowPointerEvents, setFadeOutContent, setInitialDisplay, props.setOptionNumber, 3)}
      >
        Connect to a service &#8594;
      </div>
    </div>
  );
}
