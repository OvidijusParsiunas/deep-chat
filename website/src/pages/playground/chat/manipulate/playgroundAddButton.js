import './playgroundAddButton.css';
import React from 'react';

export default function AddButton({viewMode, addComponent}) {
  return (
    <div id="playground-add-button-container" className={viewModeToClass[viewMode]}>
      <div id="playground-add-button" className="start-panel-logo" onClick={() => addComponent()}>
        <img src="/img/plus.svg" id="playground-add-button-image" className="playground-button"></img>
      </div>
    </div>
  );
}

// 1 - grid
// 2 - panorama
// 3 - expanded
const viewModeToClass = {
  1: 'playground-add-button-container-grid',
  2: 'playground-add-button-container-panorama',
  3: 'playground-add-button-container-expanded',
};
