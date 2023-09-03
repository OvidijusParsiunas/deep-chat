import './playgroundAddButton.css';
import React from 'react';

export default function AddButton({addComponent}) {
  return (
    <div id="playground-add-button-container">
      <div id="playground-add-button" onClick={() => addComponent()} className="start-panel-logo">
        <img id="playground-add-button-image" src="img/plus.svg"></img>
      </div>
    </div>
  );
}
