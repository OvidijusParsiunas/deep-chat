import './serviceRequiredField.css';
import React from 'react';

const INVALID_VALUE_CLASS = 'playground-modal-field-invalid';

function onChange(event, setValue) {
  const {value, classList} = event.target;
  setValue(value);
  if (value.trim() === '') {
    classList.add(INVALID_VALUE_CLASS);
  } else {
    classList.remove(INVALID_VALUE_CLASS);
  }
}

const Required = React.forwardRef(({title, requiredValue, setValue}, ref) => {
  return (
    <div>
      <div id="playground-service-modal-service-type-label" className="playground-service-modal-input-label">
        {title}
      </div>
      <input
        className="playground-service-modal-input"
        ref={ref}
        value={requiredValue}
        onChange={(event) => onChange(event, setValue)}
      ></input>
    </div>
  );
});

export default Required;
