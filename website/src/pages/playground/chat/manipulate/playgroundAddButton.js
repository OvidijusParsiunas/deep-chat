import './playgroundAddButton.css';
import React from 'react';

export default function AddButton({addComponent, isGrid}) {
  return (
    // only have playground-add-button-container-panorama if screen height is not a problem
    <div id="playground-add-button-container" className={isGrid ? '' : 'playground-add-button-container-panorama'}>
      <div id="playground-add-button" onClick={() => addComponent()} className="start-panel-logo">
        <img src="img/plus.svg" id="playground-add-button-image" className="playground-button"></img>
      </div>
    </div>
  );
}
