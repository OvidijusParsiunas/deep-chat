import './serviceModalCloseButtons.css';
import React from 'react';

function updateExistingConfigWithNew(existingConfig, newConfig) {
  Object.keys(existingConfig).forEach((key) => {
    delete existingConfig[key];
  });
  Object.assign(existingConfig, newConfig);
}

function submit(chatComponent, oldConfig, constructConfig, setModalDisplayed) {
  const newConfig = constructConfig();
  updateExistingConfigWithNew(oldConfig, newConfig);
  chatComponent.current.update();
  setModalDisplayed(false);
}

export default function CloseButtons({chatComponent, config, constructConfig, setModalDisplayed}) {
  return (
    <div id="playground-service-modal-close-buttons">
      <button onClick={() => setModalDisplayed(false)}>Cancel</button>
      <button onClick={() => submit(chatComponent, config, constructConfig, setModalDisplayed)}>Submit</button>
    </div>
  );
}
