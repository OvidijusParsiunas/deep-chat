import React from 'react';

const Required = React.forwardRef(({title, requiredValue, changeKey}, ref) => {
  return (
    <div style={{width: '100%'}}>
      <div style={{float: 'left', marginRight: '5px'}}>{title}</div>
      <input ref={ref} value={requiredValue} onChange={(event) => changeKey(event.target.value)}></input>
    </div>
  );
});

export default Required;
