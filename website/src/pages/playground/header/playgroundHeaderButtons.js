import './playgroundHeaderButtons.css';
import React from 'react';

export default function HeaderButtons({toggleLayout, isGrid}) {
  return (
    <div id="playground-header-buttons">
      <div className="playground-header-button" onClick={toggleLayout}>
        <img src={'img/import.svg'} className="playground-button playground-file-button"></img>
      </div>
      <div className="playground-header-button" onClick={toggleLayout}>
        <img src={'img/export.svg'} className="playground-button playground-file-button"></img>
      </div>
      <div className="playground-header-button" onClick={toggleLayout}>
        <img src={isGrid ? 'img/layout-panorama.svg' : 'img/layout-grid.svg'} className="playground-button"></img>
      </div>
    </div>
  );
}
