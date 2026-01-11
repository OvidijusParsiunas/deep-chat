import './installWithAI.css';
import React from 'react';

// not in a utility file as docusaurus reads it as a page
function navigate(setAllowPointerEvents, setFadeOutContent, setOptionNumber, number) {
  setAllowPointerEvents(false);
  setFadeOutContent(true);
  setTimeout(() => {
    setOptionNumber(number);
  }, 900);
}

export default function InstallWithAI(props) {
  const [allowPointerEvents, setAllowPointerEvents] = React.useState(false);
  const [displayDescription, setDisplayDescription] = React.useState(false);
  const [displayInstruction, setDisplayInstruction] = React.useState(false);
  const [displayCode, setDisplayCode] = React.useState(false);
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
      setDisplayDescription(true);
      customTimeout(() => {
        setDisplayInstruction(true);
        setAllowPointerEvents(true);
        customTimeout(() => {
          setDisplayCode(true);
          customTimeout(() => {
            setDisplayNavigation(true);
            customTimeout(() => {
              setItemsHoverable(true);
            }, 1000, mountedState);
          }, 1600, mountedState);
        }, 2700, mountedState);
      }, 2400, mountedState);
    }, 1000, mountedState);
  };

  function customTimeout(displayFunc, ms, mountedState) {
    setTimeout(() => {
      if (!mountedState.isMounted) return;
      displayFunc();
    }, ms);
  }

  return (
    <div
      id="start-page-install-ai"
      className={`start-page-main-details ${fadeOutContent ? 'start-page-main-details-fade-out' : ''}
      ${allowPointerEvents ? 'start-page-main-pointer-events' : 'start-page-main-no-pointer-events'}`}
    >
      <div
        id="start-page-install-ai-intro"
        className={`start-page-text start-page-large-text ${displayDescription ? 'start-page-main-details-visible' : ''}`}
      >
        Your AI coding assistant can integrate Deep Chat for you.
      </div>
      <div
        className={`start-page-text ${displayInstruction ? 'start-page-main-details-visible' : ''}`}
        style={{marginTop: '17px'}}
      >
        Use the{' '}
        <a href="https://github.com/OvidijusParsiunas/deep-chat/blob/main/llms.txt" target="_blank">
          llms.txt
        </a>{' '}
        file as a reference for installing and configuring Deep Chat:
      </div>
      <div
        id="start-page-install-ai-code"
        className={`start-page-text start-page-small-text start-page-code ${
          displayCode ? 'start-page-main-details-visible' : ''
        }`}
      >
        "Use https://github.com/OvidijusParsiunas/deep-chat/blob/main/llms.txt to add a chat component to my website."
      </div>
      <div
        id="start-page-install-ai-navigation"
        className={`start-page-text start-page-navigation ${displayNavigation ? 'start-page-main-details-visible' : ''} ${
          itemsHoverable ? 'start-page-navigation-hoverable' : ''
        }`}
        onClick={() => navigate(setAllowPointerEvents, setFadeOutContent, props.setOptionNumber, 1)}
      >
        &#8592; Back
      </div>
    </div>
  );
}
