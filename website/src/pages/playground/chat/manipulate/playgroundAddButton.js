import './playgroundAddButton.css';
import React from 'react';

export default function AddButton({isGrid, addComponent}) {
  return (
    <div
      id="playground-add-button-container"
      className={isGrid ? 'playground-add-button-container-grid' : 'playground-add-button-container-panorama'}
    >
      <div id="playground-add-button" className="start-panel-logo" onClick={() => addComponent()}>
        <img src="/img/plus.svg" id="playground-add-button-image" className="playground-button"></img>
      </div>
    </div>
  );
}
