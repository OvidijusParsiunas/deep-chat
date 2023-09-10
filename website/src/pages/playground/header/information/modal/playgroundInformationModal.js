import './playgroundInformationModal.css';
import React from 'react';

export default function InformationModal({setIsModalDisplayed}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
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
      <div className={`playground-modal ${isVisible ? 'playground-modal-fade-in' : 'playground-modal-fade-out'}`}>
        <b className="playground-modal-title playground-header-modal-title">Information</b>
        <div className="playground-header-modal-description">
          <div style={{marginBottom: 16}} className="playground-information-modal-item">
            <img
              src={'img/shield.svg'}
              id="playground-information-modal-shield"
              className="playground-information-modal-icon"
            ></img>
            <div>Deep Chat does not record or store any data.</div>
          </div>
          <div style={{marginBottom: 22}} className="playground-information-modal-item">
            <img
              src={'img/video.svg'}
              id="playground-information-modal-video"
              className="playground-information-modal-icon"
            ></img>
            <div>
              Watch the playground tutorial video{' '}
              <a href="WORK" target="_blank">
                here
              </a>
              .
            </div>
          </div>
        </div>
        <div className="playground-header-modal-buttons">
          <button className="playground-modal-button playground-modal-close-button" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
