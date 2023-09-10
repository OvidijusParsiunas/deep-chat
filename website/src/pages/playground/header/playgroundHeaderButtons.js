import InformationButton from './information/playgroundInformationButton';
import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import './playgroundHeaderButtons.css';
import './playgroundHeaderModal.css';
import React from 'react';

export default function HeaderButtons({isGrid, toggleLayout}) {
  // tracking state here as the icon does not immediately update with isGrid
  const [isGridI, setIsGridI] = React.useState(isGrid);

  function layoutIconClick() {
    toggleLayout();
    setIsGridI((state) => !state);
  }

  return (
    <div id="playground-header-buttons">
      {/* <Shield></Shield> */}
      {/* <ExportButton chatComponents={chatComponents} playgroundConfig={playgroundConfig}></ExportButton> */}
      {/* <UploadButton applyNewPlaygroundConfig={applyNewPlaygroundConfig}></UploadButton> */}
      <div className="playground-header-button" onClick={layoutIconClick}>
        <TooltipWrapper text={isGridI ? 'Panorama view' : 'Grid view'}>
          <img src={isGridI ? 'img/layout-panorama.svg' : 'img/layout-grid.svg'} className="playground-button"></img>
        </TooltipWrapper>
      </div>
      <InformationButton></InformationButton>
      {/* <Cog></Cog> */}
    </div>
  );
}
