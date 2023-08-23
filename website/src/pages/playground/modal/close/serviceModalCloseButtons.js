import './serviceModalCloseButtons.css';
import React from 'react';

function updateExistingConfigWithNew(existingConfig, newConfig) {
  Object.keys(existingConfig).forEach((key) => {
    delete existingConfig[key];
  });
  Object.assign(existingConfig, newConfig);
}

function validate(requiredFields) {
  let isValid = true;
  requiredFields.forEach((field) => {
    // api key or azure region not required for all
    if (field.current?.value.trim() === '') {
      // playground-modal-field-invalid-2 produces a visible color to grab user's attention
      field.current.classList.add('playground-modal-field-invalid', 'playground-modal-field-invalid-2');
      setTimeout(() => field.current.classList.remove('playground-modal-field-invalid-2'), 200);
      isValid = false;
    }
  });
  return isValid;
}

function submit(chatComponent, oldConfig, constructConfig, setModalDisplayed, requiredFields) {
  if (!validate(requiredFields)) return;
  const newConfig = constructConfig();
  updateExistingConfigWithNew(oldConfig, newConfig);
  chatComponent.current.update();
  setModalDisplayed(false);
}

export default function CloseButtons({chatComponent, config, constructConfig, setModalDisplayed, requiredFields}) {
  return (
    <div id="playground-service-modal-close-buttons">
      <button onClick={() => setModalDisplayed(false)}>Cancel</button>
      <button onClick={() => submit(chatComponent, config, constructConfig, setModalDisplayed, requiredFields)}>
        Submit
      </button>
    </div>
  );
}
