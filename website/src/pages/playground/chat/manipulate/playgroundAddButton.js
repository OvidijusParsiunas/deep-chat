import './playgroundAddButton.css';
import React from 'react';

export default function AddButton({addComponent}) {
  return (
    <div id="playground-add-button-container">
      <div id="playground-add-button" className="start-panel-logo" onClick={() => addComponent()}>
        <img src="img/plus.svg" id="playground-add-button-image" className="playground-button"></img>
      </div>
    </div>
  );
}
