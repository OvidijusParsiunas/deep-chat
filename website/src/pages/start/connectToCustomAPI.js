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
  const [displayAlternativesTitle, setDisplayAlternativesTitle] = React.useState(false);
  const [displayInterceptors, setDisplayInterceptors] = React.useState(false);
  const [displayHandler, setDisplayHandler] = React.useState(false);
  const [displayServers, setDisplayServers] = React.useState(false);
  const [displayServerLogos, setDisplayServerLogos] = React.useState(false);
  const [displayNavigation, setDisplayNavigation] = React.useState(false);
  const [fadeOutContent, setFadeOutContent] = React.useState(false);
  const [itemsHoverable, setItemsHoverable] = React.useState(false);

  React.useEffect(() => {
    const mountedState = {isMounted: true};
    setTimeout(() => {
      if (props.keepHeight) {
        startAnimation(mountedState);
      } else {
        setInitialDisplay(true);
        setTimeout(() => {
          if (!mountedState.isMounted) return;
          startAnimation(mountedState);
        }, 1400);
      }
    }, 100);
    return () => {
      mountedState.isMounted = false;
    };
  }, []);

  // prettier-ignore
  const startAnimation = (mountedState) => {
    setAllowPointerEvents(true);
    setDisplayRequest(true);
    customTimeout(() => {
      setDisplayRequirements(true);
      customTimeout(() => {
        setDisplayAlternativesTitle(true);
        customTimeout(() => {
          setDisplayInterceptors(true);
          customTimeout(() => {
            setDisplayHandler(true);
            customTimeout(() => {
              setDisplayServers(true);
              customTimeout(() => {
                setDisplayServerLogos(true);
                customTimeout(() => {
                  setDisplayNavigation(true);
                  customTimeout(() => {
                    setItemsHoverable(true);
                  }, 1000, mountedState);
                }, 1500, mountedState);
              }, 1000, mountedState);
            }, 4400, mountedState);
          }, 1500, mountedState);
        }, 3500, mountedState);
      }, 4000, mountedState);
    }, 3000, mountedState);
  };

  function customTimeout(displayFunc, ms, mountedState) {
    setTimeout(() => {
      if (!mountedState.isMounted) return;
      displayFunc();
    }, ms);
  }

  return (
    <div
      id="start-page-connect-to-custom"
      className={`start-page-main-details ${initialDisplay ? 'start-page-main-details-expanded' : ''} ${
        fadeOutContent ? 'start-page-main-details-fade-out' : ''
      } ${allowPointerEvents ? 'start-page-main-pointer-events' : 'start-page-main-no-pointer-events'}`}
    >
      <div className={`start-page-text start-page-large-text ${displayRequest ? 'start-page-main-details-visible' : ''}`}>
        Configure your connection settings using the{' '}
        <a href="https://deepchat.dev/docs/connect#connect-1" target="_blank">
          connect
        </a>{' '}
        property:
      </div>
      <div
        className={`start-page-text start-page-small-text start-page-code ${
          displayRequest ? 'start-page-main-details-visible' : ''
        }`}
      >
        {`<deep-chat connect='{"url":"https://service.com/chat"}'/>`}
      </div>
      <div
        id="start-page-requirements"
        className={`start-page-text ${displayRequirements ? 'start-page-main-details-visible' : ''}`}
      >
        The target service needs to be able to handle Deep Chat's{' '}
        <a href="https://deepchat.dev/docs/connect" target="_blank">
          request
        </a>{' '}
        and{' '}
        <a href="https://deepchat.dev/docs/connect#Response" target="_blank">
          response
        </a>{' '}
        formats.
      </div>
      <div
        className={`start-page-text ${displayAlternativesTitle ? 'start-page-main-details-visible' : ''}`}
        style={{marginTop: '20px'}}
      >
        To avoid making changes to the service, use any of the following approaches:
      </div>
      <div></div>
      <div
        className={`start-page-text start-page-small-text start-page-connect-to-custom-padded-content ${
          displayInterceptors ? 'start-page-main-details-visible' : ''
        }`}
        style={{marginTop: '15px'}}
      >
        - Add{' '}
        <a href="https://deepchat.dev/docs/interceptors" target="_blank">
          interceptor
        </a>{' '}
        properties to augment the transferred objects.
      </div>
      <div
        className={`start-page-text start-page-small-text start-page-connect-to-custom-padded-content ${
          displayHandler ? 'start-page-main-details-visible' : ''
        }`}
        style={{marginTop: '10px'}}
      >
        - Use a{' '}
        <a href="https://deepchat.dev/docs/connect#Handler" target="_blank">
          handler
        </a>{' '}
        function to control the request logic with your own code.
      </div>
      <div
        style={{marginTop: '20px'}}
        className={`start-page-text ${displayServers ? 'start-page-main-details-visible' : ''}`}
      >
        When creating a new server, use these example templates:
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
