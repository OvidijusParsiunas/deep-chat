import React from 'react';

function changeFirstLetter(string, capitalize = true) {
  return string.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + string.slice(1);
}

export default function ServiceType({availableTypes, activeType, changeType, pseudoNames}) {
  return (
    <div style={{width: '100%'}}>
      <div style={{float: 'left', marginRight: '5px'}}>Type:</div>
      <select value={activeType} onChange={(event) => changeType(event.target.value)}>
        {availableTypes?.map((type, index) => {
          return (
            <option value={type} key={index}>
              {pseudoNames[type] || changeFirstLetter(type)}
            </option>
          );
        })}
      </select>
    </div>
  );
}
