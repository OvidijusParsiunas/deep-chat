import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import UploadButton from './playgroundUploadButton';
import ExportButton from './playgroundExportButton';
import './playgroundHeaderButtons.css';
import React from 'react';

export default function HeaderButtons({toggleLayout, isGrid, chatComponents, applyNewPlaygroundConfig}) {
  // tracking state here as the icon does not immediately update with isGrid
  const [isGridI, setIsGridI] = React.useState(isGrid);

  function layoutIconClick() {
    toggleLayout();
    setIsGridI((state) => !state);
  }

  return (
    <div id="playground-header-buttons">
      <ExportButton chatComponents={chatComponents}></ExportButton>
      <UploadButton applyNewPlaygroundConfig={applyNewPlaygroundConfig}></UploadButton>
      <div className="playground-header-button" onClick={layoutIconClick}>
        <TooltipWrapper text={isGridI ? 'Panorama view' : 'Grid view'}>
          <img src={isGridI ? 'img/layout-panorama.svg' : 'img/layout-grid.svg'} className="playground-button"></img>
        </TooltipWrapper>
      </div>
    </div>
  );
}
