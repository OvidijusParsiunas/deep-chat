import springBootLogo from '/img/springBootLogo.png';
import expressJSLogo from '/img/expressLogo.png';
import nestJSLogo from '/img/nestLogo.png';
import flaskLogo from '/img/flaskLogo.png';
import nextLogo from '/img/nextLogo.png';
import goLogo from '/img/goLogo.png';
import './connectToCustomAPI.css';
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
      className={`start-page-logos start-page-connect-to-custom-padded-content ${
        props.displayProxyLogos ? 'start-page-display-logos' : ''
      } ${props.itemsHoverable ? 'start-page-hoverable-logos' : ''}`}
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

export default function ConnectToCustomAPI(props) {
  const [initialDisplay, setInitialDisplay] = React.useState(props.keepHeight);
  const [allowPointerEvents, setAllowPointerEvents] = React.useState(false);
  const [displayRequest, setDisplayRequest] = React.useState(false);
  const [displayRequirements, setDisplayRequirements] = React.useState(false);
  const [displayOptionsTitle, setDisplayOptionsTitle] = React.useState(false);
  const [displayInterceptors, setDisplayInterceptors] = React.useState(false);
  const [displayInteceptorsExamples, setDisplayInteceptorsExamples] = React.useState(false);
  const [displayServers, setDisplayServers] = React.useState(false);
  const [displayServerLogos, setDisplayServerLogos] = React.useState(false);
  const [displayNavigation, setDisplayNavigation] = React.useState(false);
  const [fadeOutContent, setFadeOutContent] = React.useState(false);
  const [itemsHoverable, setItemsHoverable] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      if (props.keepHeight) {
        startAnimation();
      } else {
        setInitialDisplay(true);
        setTimeout(() => {
          startAnimation();
        }, 1400);
      }
    }, 100);
  }, []);

  const startAnimation = () => {
    setAllowPointerEvents(true);
    setDisplayRequest(true);
    setTimeout(() => {
      setDisplayRequirements(true);
      setTimeout(() => {
        setDisplayOptionsTitle(true);
        setTimeout(() => {
          setDisplayInterceptors(true);
          setTimeout(() => {
            setDisplayInteceptorsExamples(true);
            setTimeout(() => {
              setDisplayServers(true);
              setTimeout(() => {
                setDisplayServerLogos(true);
                setTimeout(() => {
                  setDisplayNavigation(true);
                  setTimeout(() => {
                    setItemsHoverable(true);
                  }, 1000);
                }, 1500);
              }, 1000);
            }, 2400);
          }, 1500);
        }, 2400);
      }, 4200);
    }, 3000);
  };

  return (
    <div
      id="start-page-connect-to-custom"
      className={`start-page-main-details ${initialDisplay ? 'start-page-main-details-expanded' : ''} ${
        fadeOutContent ? 'start-page-main-details-fade-out' : ''
      } ${allowPointerEvents ? 'start-page-main-pointer-events' : 'start-page-main-no-pointer-events'}`}
    >
      <div className={`start-page-text start-page-large-text ${displayRequest ? 'start-page-main-details-visible' : ''}`}>
        1. Configure your connection settings using the{' '}
        <a href="https://deepchat.dev/docs/interceptors" target="_blank">
          request
        </a>{' '}
        property:
      </div>
      <div
        className={`start-page-text start-page-small-text start-page-code ${
          displayRequest ? 'start-page-main-details-visible' : ''
        }`}
      >
        {`<deep-chat request='{"url":"https://service.com/chat"}'/>`}
      </div>
      <div
        id="start-page-requirements"
        className={`start-page-text start-page-large-text ${displayRequirements ? 'start-page-main-details-visible' : ''}`}
      >
        The target service needs to handle{' '}
        <a href="https://deepchat.dev/docs/connect" target="_blank">
          request message
        </a>
        s and respond using the{' '}
        <a href="https://deepchat.dev/docs/connect#Result" target="_blank">
          result
        </a>{' '}
        format.
      </div>
      <div
        className={`start-page-text ${displayOptionsTitle ? 'start-page-main-details-visible' : ''}`}
        style={{marginTop: '20px'}}
      >
        2. Choose one of the following options to complete your setup:
      </div>
      <div></div>
      <div
        className={`start-page-text start-page-connect-to-custom-padded-content ${
          displayInterceptors ? 'start-page-main-details-visible' : ''
        }`}
        style={{marginTop: '20px'}}
      >
        - Use{' '}
        <a href="https://deepchat.dev/docs/interceptors" target="_blank">
          interceptor
        </a>{' '}
        properties to avoid making changes to an existing server:
      </div>
      <div
        id="start-page-connect-to-custom-interceptor"
        className="start-page-text start-page-small-text start-page-code start-page-main-details-visible start-page-connect-to-custom-padded-content"
      >
        <a
          href="https://deepchat.dev/docs/interceptors#requestInterceptor"
          target="_blank"
          className={`interceptor-code ${displayInteceptorsExamples ? 'start-page-main-details-visible' : ''}`}
        >
          requestInterceptor
        </a>{' '}
        <a
          href="https://deepchat.dev/docs/interceptors#responseInterceptor"
          target="_blank"
          className={`interceptor-code ${displayInteceptorsExamples ? 'start-page-main-details-visible' : ''}`}
        >
          responseInterceptor
        </a>
      </div>
      <div
        className={`start-page-text start-page-connect-to-custom-padded-content ${
          displayServers ? 'start-page-main-details-visible' : ''
        }`}
      >
        - Create your own server using one of the following templates:
      </div>
      <ProxyLogos displayProxyLogos={displayServerLogos} itemsHoverable={itemsHoverable}></ProxyLogos>
      <div
        id="start-page-connect-to-custom-navigation"
        className={`start-page-text start-page-navigation start-page-connect-to-custom-padded-content ${
          displayNavigation ? 'start-page-main-details-visible' : ''
        } ${itemsHoverable ? 'start-page-navigation-hoverable' : ''}`}
        onClick={() => navigate(setAllowPointerEvents, setFadeOutContent, setInitialDisplay, props.setOptionNumber, 3)}
      >
        &#8592; Back
      </div>
    </div>
  );
}
