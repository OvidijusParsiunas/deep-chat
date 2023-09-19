import InformationButton from './information/playgroundInformationButton';
import LayoutButton from './layout/playgroundLayoutButton';
import './playgroundHeaderButtons.css';
import './playgroundHeaderModal.css';
import React from 'react';

export default function HeaderButtons({isGrid, toggleLayout}) {
  return (
    <div id="playground-header-buttons">
      {/* <Shield></Shield> */}
      {/* <ExportButton chatComponents={chatComponents} playgroundConfig={playgroundConfig}></ExportButton> */}
      {/* <UploadButton applyNewPlaygroundConfig={applyNewPlaygroundConfig}></UploadButton> */}
      <LayoutButton isGrid={isGrid} toggleLayout={toggleLayout}></LayoutButton>
      <InformationButton></InformationButton>
      {/* <Cog></Cog> */}
    </div>
  );
}
