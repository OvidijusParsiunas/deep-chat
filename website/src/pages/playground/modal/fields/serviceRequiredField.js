import React from 'react';

const Required = React.forwardRef(({title, requiredValue, changeKey}, ref) => {
  return (
    <div>
      <div className="playground-service-modal-input-label">{title}</div>
      <input ref={ref} value={requiredValue} onChange={(event) => changeKey(event.target.value)}></input>
    </div>
  );
});

export default Required;
