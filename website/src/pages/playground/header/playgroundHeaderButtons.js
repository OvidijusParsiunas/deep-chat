import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import './playgroundHeaderButtons.css';
import React from 'react';

export default function HeaderButtons({toggleLayout, isGrid}) {
  // tracking state here as the icon does not immediately update with isGrid
  const [isGridI, setIsGridI] = React.useState(isGrid);

  function layoutIconClick() {
    toggleLayout();
    setIsGridI((state) => !state);
  }

  return (
    <div id="playground-header-buttons">
      <div className="playground-header-button" onClick={toggleLayout}>
        <TooltipWrapper text="Download">
          <img src={'img/import.svg'} className="playground-button playground-file-button"></img>
        </TooltipWrapper>
      </div>
      <div className="playground-header-button" onClick={toggleLayout}>
        <TooltipWrapper text="Upload">
          <img src={'img/export.svg'} className="playground-button playground-file-button"></img>
        </TooltipWrapper>
      </div>
      <div className="playground-header-button" onClick={layoutIconClick}>
        <TooltipWrapper text={isGridI ? 'Panorama view' : 'Grid view'}>
          <img src={isGridI ? 'img/layout-panorama.svg' : 'img/layout-grid.svg'} className="playground-button"></img>
        </TooltipWrapper>
      </div>
    </div>
  );
}
