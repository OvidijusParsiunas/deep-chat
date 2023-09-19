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
        <div id="playground-information-modal-title" className="playground-modal-title playground-header-modal-title">
          {isIntro ? 'Welcome to the Playground' : 'Information'}
        </div>
        <div className="playground-header-modal-description">
          <div style={{marginBottom: 16}} className="playground-information-modal-item">
            <svg
              id="playground-information-modal-connect"
              className="playground-information-modal-icon"
              viewBox="0 0 50 50"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 30c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
              <path d="M35 20c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
              <path d="M35 40c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
              <path d="M19.007 25.885l12.88 6.44-.895 1.788-12.88-6.44z" />
              <path d="M30.993 15.885l.894 1.79-12.88 6.438-.894-1.79z" />
            </svg>
            <div>Create, configure and experiment with Deep Chat components without writing any code.</div>
          </div>
          <div style={{marginBottom: 18}} className="playground-information-modal-item">
            <svg
              id="playground-information-modal-shield"
              className="playground-information-modal-icon"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M24,43.5c9.0432-3.1174,15.4885-10.3631,16.5-19.5889a79.36,79.36,0,0,0-.0714-12.0267,2.5414,2.5414,0,0,0-2.4677-2.3663c-4.0911-.126-8.8455-.8077-12.52-4.4273a2.0516,2.0516,0,0,0-2.881,0C18.885,8.71,14.1306,9.3921,10.04,9.5181a2.5414,2.5414,0,0,0-2.4677,2.3663A79.36,79.36,0,0,0,7.5,23.9111C8.5115,33.1369,14.9568,40.3826,24,43.5Z"
              />
            </svg>
            <div>The playground does not record any data. All information remains in the safety of your browser.</div>
          </div>
          <div style={{marginBottom: 22}} className="playground-information-modal-item">
            <a href="https://youtu.be/bQDliqCQHbA" target="_blank">
              <svg
                id="playground-information-modal-video"
                className="playground-information-modal-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20.5949 4.45999C21.5421 4.71353 22.2865 5.45785 22.54 6.40501C22.9982 8.12001 23 11.7004 23 11.7004C23 11.7004 23 15.2807 22.54 16.9957C22.2865 17.9429 21.5421 18.6872 20.5949 18.9407C18.88 19.4007 12 19.4007 12 19.4007C12 19.4007 5.12001 19.4007 3.405 18.9407C2.45785 18.6872 1.71353 17.9429 1.45999 16.9957C1 15.2807 1 11.7004 1 11.7004C1 11.7004 1 8.12001 1.45999 6.40501C1.71353 5.45785 2.45785 4.71353 3.405 4.45999C5.12001 4 12 4 12 4C12 4 18.88 4 20.5949 4.45999ZM15.5134 11.7007L9.79788 15.0003V8.40101L15.5134 11.7007Z"
                  stroke="#000000"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div>
              Watch the playground tutorial{' '}
              <a href="https://youtu.be/bQDliqCQHbA" target="_blank">
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
