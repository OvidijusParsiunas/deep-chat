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

// view is used to identify if visibility can be toggled by user
const Required = React.forwardRef(({title, requiredValue, setValue, view, changeCode}, ref) => {
  const [isVisible, setIsVisible] = React.useState(!!view?.isKeyVisible);

  return (
    <div>
      <div id="playground-service-modal-service-type-label" className="playground-service-modal-input-label">
        {title}
      </div>
      <input
        className={`playground-service-modal-input ${view ? 'playground-service-modal-visibility-input' : ''}`}
        ref={ref}
        value={requiredValue}
        onChange={(event) => onChange(event, setValue)}
        type={!view || isVisible ? 'text' : 'password'}
      ></input>
      {view && (
        <div id="visibility-icon-container">
          <img
            src={isVisible ? 'img/visible.svg' : 'img/notVisible.svg'}
            className="visibility-icon"
            onClick={() => {
              const newState = !view.isKeyVisible;
              view.isKeyVisible = newState;
              setIsVisible(newState);
              changeCode();
            }}
          ></img>
        </div>
      )}
    </div>
  );
});

export default Required;
