import './playgroundExportModal.css';
import React from 'react';

export default function ExportModal({chatComponents, setIsModalDisplayed, playgroundConfig}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isRedactionVisible, setRedactionVisible] = React.useState(false);
  // playgroundConfig.redactKeys - not present and needs to be added
  const [isRedactSelected, setIsRedactSelected] = React.useState(false);

  React.useEffect(() => {
    setRedactCheckbox();
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

  const setRedactCheckbox = () => {
    const isKeyPresent = chatComponents.find((component) => {
      const {connect} = component.ref.current.config;
      const service = Object.keys(connect)[0];
      return connect[service].key;
    });
    setRedactionVisible(!!isKeyPresent);
  };

  const handleExport = () => {
    const playgroundConfig = createPlaygroundConfig();
    if (isRedactSelected) redact();
    const jsonContent = JSON.stringify(playgroundConfig, null, 2);
    const blob = new Blob([jsonContent], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deep-chat-playground.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createPlaygroundConfig = () => {
    const newPlaygroundConfig = {
      ...playgroundConfig,
      components: chatComponents.map((component) => component.ref.current.config),
    };
    return JSON.parse(JSON.stringify(newPlaygroundConfig));
  };

  const redact = () => {
    playgroundConfig.components.forEach((component) => {
      const {connect} = component;
      const service = Object.keys(connect)[0];
      if (connect[service].key) {
        connect[service].key = createRedactString(connect[service].key.length);
      }
    });
  };

  const createRedactString = (length) => {
    let string = '';
    for (let i = 0; i < length; i++) {
      string += '-';
    }
    return string;
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
        <b className="playground-modal-title playground-header-modal-title">Export Config</b>
        <div className="playground-header-modal-description">
          Export your playground configuration to continue where you left of next time.
        </div>
        {isRedactionVisible && (
          <div id="playground-export-modal-checkbox-description" className="playground-header-modal-description">
            <input
              type="checkbox"
              id="playground-export-modal-checkbox"
              checked={isRedactSelected}
              onChange={() => {
                const newState = !isRedactSelected;
                setIsRedactSelected(newState);
                // playgroundConfig.redactKeys = newState;
              }}
            />
            <div>Redact API Keys</div>
          </div>
        )}
        <div className="playground-header-modal-buttons">
          <button className="playground-modal-button playground-modal-close-button" onClick={close}>
            Close
          </button>
          <button className="playground-modal-button playground-modal-submit-button" onClick={handleExport}>
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
