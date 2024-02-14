import YoutubeLogo from '/img/youtube.png';
import './aiInYourBrowser.css';
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

export default function AIInyourBrowser(props) {
  const [initialDisplay, setInitialExpanded] = React.useState(props.keepHeight);
  const [allowPointerEvents, setAllowPointerEvents] = React.useState(false);
  const [displayServer, setDisplayServer] = React.useState(1);
  const [displayConnect, setDisplayConnect] = React.useState(1);
  const [displayLimits, setDisplayLimits] = React.useState(1);
  const [displayDescription, setDisplayDescription] = React.useState(false);
  const [displayModule, setDisplayModule] = React.useState(false);
  const [displayProperty, setDisplayProperty] = React.useState(false);
  const [displayDemo, setDisplayDemo] = React.useState(false);
  const [displayNavigation, setDisplayNavigation] = React.useState(false);
  const [fadeOutContent, setFadeOutContent] = React.useState(false);
  const [itemsHoverable, setItemsHoverable] = React.useState(false);

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
      setDisplayServer(2);
      customTimeout(() => {
        setDisplayServer(3);
        customTimeout(() => {
          setDisplayConnect(2);
          customTimeout(() => {
            setDisplayConnect(3);
            customTimeout(() => {
              setDisplayLimits(2);
              customTimeout(() => {
                setDisplayLimits(3);
                customTimeout(() => {
                  setDisplayDescription(true);
                  customTimeout(() => {
                    setInitialExpanded(true);
                    customTimeout(() => {
                      setDisplayModule(true);
                      setAllowPointerEvents(true);
                      customTimeout(() => {
                        setDisplayProperty(true);
                        customTimeout(() => {
                          setDisplayDemo(true);
                          customTimeout(() => {
                            setDisplayNavigation(true);
                            customTimeout(() => {
                              setItemsHoverable(true);
                            }, 1000, mountedState);
                          }, 1500, mountedState);
                        }, 2000, mountedState);
                      }, 3500, mountedState);
                    }, 1800, mountedState);
                  }, 1400, mountedState);
                }, 1100, mountedState);
              }, 1100, mountedState);
            }, 700, mountedState);
          }, 1100, mountedState);
        }, 700, mountedState);
      }, 1100, mountedState);
    }, 100, mountedState);
  };

  function customTimeout(displayFunc, ms, mountedState) {
    setTimeout(() => {
      if (!mountedState.isMounted) return;
      displayFunc();
    }, ms);
  }

  return (
    <div
      id="start-page-web-model"
      className={`start-page-main-details ${initialDisplay ? 'start-page-main-details-expanded' : ''} ${
        fadeOutContent ? 'start-page-main-details-fade-out' : ''
      } ${allowPointerEvents ? 'start-page-main-pointer-events' : 'start-page-main-no-pointer-events'}`}
    >
      <div
        style={{marginLeft: '47px'}}
        className={`start-page-text start-page-large-text start-page-web-model-slide ${
          displayConnect > 1 && 'start-page-web-model-slide-visible'
        }
      ${displayConnect === 3 && 'start-page-web-model-slide-visible-out'}`}
      >
        No Connection
      </div>
      <div
        className={`start-page-text start-page-large-text start-page-web-model-slide ${
          displayServer > 1 && 'start-page-web-model-slide-visible'
        }
      ${displayServer === 3 && 'start-page-web-model-slide-visible-out'}`}
      >
        No Server
      </div>
      <div
        className={`start-page-text start-page-large-text start-page-web-model-slide ${
          displayLimits > 1 && 'start-page-web-model-slide-visible'
        }
      ${displayLimits === 3 && 'start-page-web-model-slide-visible-out'}`}
      >
        No Limits
      </div>
      <div
        id="start-page-web-model-intro"
        className={`start-page-text start-page-large-text ${displayDescription ? 'start-page-main-details-visible' : ''}`}
      >
        Host a language model entirely on your browser.
      </div>
      <div
        className={`start-page-text ${displayModule ? 'start-page-main-details-visible' : ''}`}
        style={{marginTop: '15px'}}
      >
        1. Add the{' '}
        <a href="https://deepchat.dev/docs/webModel" target="_blank">
          deep-chat-web-llm
        </a>{' '}
        <a href="https://deepchat.dev/examples/externalModules" target="_blank">
          external module
        </a>
        :
      </div>
      <div
        id="start-page-web-model-instructions"
        className={`start-page-text start-page-small-text start-page-code ${
          displayModule ? 'start-page-main-details-visible' : ''
        }`}
      >
        {`import * as webLLM from 'deep-chat-web-llm'`}
        <br />
        {`window.webLLM = webLLM;`}
      </div>
      <div
        className={`start-page-text ${displayProperty ? 'start-page-main-details-visible' : ''}`}
        style={{marginTop: '21px'}}
      >
        2. Define the{' '}
        <a href="https://deepchat.dev/docs/webModel" target="_blank">
          webModel
        </a>{' '}
        property:
      </div>
      <div
        id="start-page-web-model-property"
        className={`start-page-text start-page-small-text start-page-code ${
          displayProperty ? 'start-page-main-details-visible' : ''
        }`}
      >
        {`<deep-chat webModel="true"/>`}
      </div>
      <div
        id="start-page-web-model-video"
        className={`start-page-text ${displayDemo ? 'start-page-main-details-visible' : ''}`}
      >
        <a href="https://youtu.be/ilzVAooE4HI?si=G1u096YDAR1HkKqt">
          <img src={YoutubeLogo} id="start-page-web-model-video-icon" className={'youtube-icon'} />
          <span>Demo Video</span>
        </a>
      </div>
      <div
        id="start-page-web-model-navigation"
        className={`start-page-text start-page-navigation ${displayNavigation ? 'start-page-main-details-visible' : ''} ${
          itemsHoverable ? 'start-page-navigation-hoverable' : ''
        }`}
        onClick={() => navigate(setAllowPointerEvents, setFadeOutContent, setInitialExpanded, props.setOptionNumber, 1)}
      >
        &#8592; Back
      </div>
    </div>
  );
}
