import './playgroundUploadModal.css';
import React from 'react';

export default function UploadModal({setIsModalDisplayed, applyNewPlaygroundConfig}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setIsVisible(true);
    window.addEventListener('keydown', closeOnKeyPress);
    return () => {
      window.removeEventListener('keydown', closeOnKeyPress);
    };
  }, []);

  const closeOnKeyPress = (event) => {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'Enter') {
      handleExport();
    }
  };

  const handleUpload = (event) => {
    const inputElement = event.target;
    const file = inputElement.files?.[0];
    handleFile(file);
    inputElement.value = ''; // resetting to prevent Chrome issue of not being able to upload same file twice
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const newConfig = JSON.parse(event.target.result);
        if (!validate(newConfig)) throw 'Validation error';
        process(newConfig);
        applyNewPlaygroundConfig(newConfig);
        close();
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        setIsError(true);
      }
    };
    reader.readAsText(file);
  };

  const validate = (newConfig) => {
    if (!newConfig.components) return false;
    const incorrectFound = newConfig.components.find(
      (component) => !component.connect || !component.messages || typeof component.description !== 'string'
    );
    return !incorrectFound;
  };

  const process = (newConfig) => {
    newConfig.components.forEach((component) => {
      const {connect} = component;
      // fills empty keys
      const service = Object.keys(connect)[0];
      if (connect[service].key === '') {
        connect[service].key = '----';
      }
    });
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
        <b className="playground-modal-title playground-header-modal-title">Upload Config</b>
        <div className="playground-header-modal-description">
          Upload your playground configuration to create chats with your setup and continue where you left of.
        </div>
        {isError && (
          <div id="playground-upload-modal-error" className="playground-header-modal-description">
            Error in the uploaded file
          </div>
        )}
        <div id="playground-upload-modal-buttons" className="playground-header-modal-buttons">
          <button className="playground-modal-button playground-modal-close-button" onClick={close}>
            Close
          </button>
          <input ref={inputRef} id="playground-upload-modal-input" type="file" accept=".json" onChange={handleUpload} />
          <button
            className="playground-modal-button playground-modal-submit-button"
            onClick={() => inputRef.current.click()}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
