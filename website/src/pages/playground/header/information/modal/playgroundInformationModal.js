import './playgroundInformationModal.css';
import React from 'react';

export default function InformationModal({setIsModalDisplayed, isIntro}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }); // in a timeout as intro modal does not display animation in firefox+safari
    window.addEventListener('keydown', closeOnKeyPress);
    return () => {
      window.removeEventListener('keydown', closeOnKeyPress);
    };
  }, []);

  const closeOnKeyPress = (event) => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      close();
    }
  };

  const close = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsModalDisplayed(false);
    }, 200);
  };

  return (
    <div>
      <div
        className={`playground-service-modal-background ${
          isVisible ? 'playground-modal-fade-in-background' : 'playground-modal-fade-out-background'
        }`}
        onClick={close}
      ></div>
      <div
        id="playground-information-modal"
        className={`playground-modal ${isVisible ? 'playground-modal-fade-in' : 'playground-modal-fade-out'} ${
          isIntro ? 'playground-intro-modal' : ''
        }`}
      >
        <b className="playground-modal-title playground-header-modal-title">
          {isIntro ? 'Welcome to the Playground' : 'Information'}
        </b>
        <div className="playground-header-modal-description">
          <div style={{marginBottom: 16, marginTop: 3}} className="playground-information-modal-item">
            <img
              src={'img/connect.svg'}
              id="playground-information-modal-connect"
              className="playground-information-modal-icon"
            ></img>
            <div>Create, configure and experiment with Deep Chat without have to write any code.</div>
          </div>
          <div style={{marginBottom: 18}} className="playground-information-modal-item">
            <img
              src={'img/shield.svg'}
              id="playground-information-modal-shield"
              className="playground-information-modal-icon"
            ></img>
            <div>The playground does not record any data. All information remains in the safety of your browser.</div>
          </div>
          <div style={{marginBottom: 22}} className="playground-information-modal-item">
            <img
              src={'img/video.svg'}
              id="playground-information-modal-video"
              className="playground-information-modal-icon"
            ></img>
            <div>
              Watch the playground tutorial{' '}
              <a href="WORK" target="_blank">
                video
              </a>
              .
            </div>
          </div>
        </div>
        <div className="playground-header-modal-buttons">
          <button
            id="playground-information-modal-close-button"
            className="playground-modal-button playground-modal-close-button"
            onClick={close}
          >
            {isIntro ? 'Start' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
