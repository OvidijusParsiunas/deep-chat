import InformationButton from './information/playgroundInformationButton';
import LayoutButton from './layout/playgroundLayoutButton';
import './playgroundHeaderButtons.css';
import './playgroundHeaderModal.css';
import React from 'react';

export default function HeaderButtons({viewMode, toggleLayout}) {
  return (
    <div id="playground-header-buttons">
      {/* <Shield></Shield> */}
      {/* <ExportButton chatComponents={chatComponents} playgroundConfig={playgroundConfig}></ExportButton> */}
      {/* <UploadButton applyNewPlaygroundConfig={applyNewPlaygroundConfig}></UploadButton> */}
      <LayoutButton viewMode={viewMode} toggleLayout={toggleLayout}></LayoutButton>
      <InformationButton></InformationButton>
      {/* <Cog></Cog> */}
    </div>
  );
}
