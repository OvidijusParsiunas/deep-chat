import React from 'react';

export default function LiveData(props) {
  return props.data.map((dataText, index) => {
    const text = dataText === '' ? '' : JSON.stringify(dataText);
    return (
      <div key={index}>
        {'>'} {text}
      </div>
    );
  });
}
