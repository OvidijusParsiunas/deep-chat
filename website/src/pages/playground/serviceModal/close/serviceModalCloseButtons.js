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

function submit(chatComponent, constructConnect, close, requiredFields) {
  if (!validate(requiredFields)) return;
  const newConfig = constructConnect();
  updateExistingConfigWithNew(chatComponent.connect, newConfig);
  chatComponent.update();
  close();
}

const CloseButtons = React.forwardRef(({chatComponent, constructConnect, close, requiredFields}, ref) => {
  return (
    <div id="playground-service-modal-close-buttons">
      <button className="playground-modal-button playground-modal-close-button" onClick={close}>
        Close
      </button>
      <button
        ref={ref}
        className="playground-modal-button playground-modal-submit-button"
        onClick={() => submit(chatComponent, constructConnect, close, requiredFields)}
      >
        Submit
      </button>
    </div>
  );
});

export default CloseButtons;
