import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import springBootLogo from '/img/springBootLogo.png';
import expressJSLogo from '/img/expressLogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import nestJSLogo from '/img/nestLogo.png';
import flaskLogo from '/img/flaskLogo.png';
import nextLogo from '/img/nextLogo.png';
import goLogo from '/img/goLogo.png';
import './connectToPopularAPI.css';
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

function ProxyLogos(props) {
  return (
    <div
      className={`start-page-logos ${props.displayProxyLogos ? 'start-page-display-logos' : ''} ${
        props.itemsHoverable ? 'start-page-hoverable-logos' : ''
      }`}
    >
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/node/express" target="_blank">
          <img src={expressJSLogo} width="38" style={{paddingTop: 9}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/node/nestjs" target="_blank">
          <img src={nestJSLogo} width="38" style={{paddingTop: 10}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/java/springboot" target="_blank">
          <img src={springBootLogo} width="37" style={{paddingTop: 10.5}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/go" target="_blank">
          <img src={goLogo} width="26" style={{paddingTop: 10}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/python/flask" target="_blank">
          <img src={flaskLogo} width="37" style={{paddingTop: 8, transform: 'scaleX(0.95)'}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/nextjs" target="_blank">
          <img src={nextLogo} width="36" style={{paddingTop: 10}} />
        </a>
      </div>
    </div>
  );
}

function DirectLogos(props) {
  return (
    <div
      className={`start-page-logos ${props.displayDirectLogos ? 'start-page-display-logos' : ''} ${
        props.itemsHoverable ? 'start-page-hoverable-logos' : ''
      }`}
    >
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/docs/directConnection/OpenAI" target="_blank">
          <img src={openAILogo} width="34" style={{paddingTop: 11}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/docs/directConnection/HuggingFace" target="_blank">
          <img src={huggingFaceLogo} width="47" style={{paddingTop: 4}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/docs/directConnection/Cohere" target="_blank">
          <img src={cohereLogo} width="51" style={{paddingTop: 3}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/docs/directConnection/StabilityAI" target="_blank">
          <img src={stabilityAILogo} width="43" style={{paddingTop: 6}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/docs/directConnection/AssemblyAI" target="_blank">
          <img src={assemblyAILogo} width="33" style={{paddingTop: 11}} />
        </a>
      </div>
      <div className="start-page-logo start-panel-logo">
        <a href="https://deepchat.dev/docs/directConnection/Azure" target="_blank">
          <img src={azureLogo} width="41" style={{paddingTop: 10}} />
        </a>
      </div>
    </div>
  );
}

export default function ConnectToPopularAPI(props) {
  const [initialDisplay, setInitialDisplay] = React.useState(false);
  const [allowPointerEvents, setAllowPointerEvents] = React.useState(false);
  const [displayDirect, setDisplayDirect] = React.useState(false);
  const [displayDirectLogos, setDisplayDirectLogos] = React.useState(false);
  const [displayProxy, setDisplayProxy] = React.useState(false);
  const [displayProxyLogos, setDisplayProxyLogos] = React.useState(false);
  const [displayNavigation, setDisplayNavigation] = React.useState(false);
  const [itemsHoverable, setItemsHoverable] = React.useState(false);
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
        setDisplayDirect(true);
        customTimeout(() => {
          setDisplayDirectLogos(true);
          customTimeout(() => {
            setDisplayProxy(true);
            customTimeout(() => {
              setDisplayProxyLogos(true);
              customTimeout(() => {
                setDisplayNavigation(true);
                customTimeout(() => {
                  setItemsHoverable(true);
                }, 1000, mountedState);
              }, 1000, mountedState);
            }, 1000, mountedState);
          }, 1500, mountedState);
        }, 1000, mountedState);
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
      id="start-page-connect-to-popular"
      className={`start-page-main-details ${initialDisplay ? 'start-page-main-details-expanded' : ''} ${
        fadeOutContent ? 'start-page-main-details-fade-out' : ''
      } ${allowPointerEvents ? 'start-page-main-pointer-events' : 'start-page-main-no-pointer-events'}`}
    >
      <div className={`start-page-text start-page-large-text ${displayDirect ? 'start-page-main-details-visible' : ''}`}>
        Direct connection
      </div>
      <div className={`start-page-text start-page-small-text ${displayDirect ? 'start-page-main-details-visible' : ''}`}>
        The quickest way to connect to a popular AI API is to use the{' '}
        <a href="https://deepchat.dev/docs/directConnection/" target="_blank">
          directConnection
        </a>{' '}
        property:
      </div>
      <DirectLogos displayDirectLogos={displayDirectLogos} itemsHoverable={itemsHoverable}></DirectLogos>
      <div
        className={`start-page-text ${displayProxy ? 'start-page-main-details-visible' : ''}`}
        style={{marginTop: '24px'}}
      >
        Proxy service
      </div>
      <div className={`start-page-text start-page-small-text ${displayProxy ? 'start-page-main-details-visible' : ''}`}>
        When your application is ready to go live, use any of these example servers:
      </div>
      <ProxyLogos displayProxyLogos={displayProxyLogos} itemsHoverable={itemsHoverable}></ProxyLogos>
      <div
        id="start-page-connect-to-popular-navigation-left"
        className={`start-page-text start-page-navigation start-page-connect-to-popular-navigation ${
          displayNavigation ? 'start-page-main-details-visible' : ''
        } ${itemsHoverable ? 'start-page-navigation-hoverable' : ''}`}
        onClick={() => navigate(setAllowPointerEvents, setFadeOutContent, setInitialDisplay, props.setOptionNumber, 3)}
      >
        &#8592; Back
      </div>
      <div
        id="start-page-connect-to-popular-navigation-right"
        className={`start-page-text start-page-navigation start-page-connect-to-popular-navigation ${
          displayNavigation ? 'start-page-main-details-visible' : ''
        } ${itemsHoverable ? 'start-page-navigation-hoverable' : ''}`}
        onClick={() => {
          setFadeOutContent(true);
          setTimeout(() => {
            props.setOptionNumber(5, true);
          }, 900);
        }}
      >
        Connect to a custom service &#8594;
      </div>
    </div>
  );
}
