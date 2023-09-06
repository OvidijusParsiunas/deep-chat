import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import './playgroundHeaderButtons.css';
import React from 'react';

export default function HeaderButtons({toggleLayout, isGrid, chatComponents, applyNewGlobalConfig}) {
  // tracking state here as the icon does not immediately update with isGrid
  const [isGridI, setIsGridI] = React.useState(isGrid);
  const uploadRef = React.useRef(null);

  function layoutIconClick() {
    toggleLayout();
    setIsGridI((state) => !state);
  }

  return (
    <div id="playground-header-buttons">
      <div className="playground-header-button" onClick={() => handleExport(chatComponents)}>
        <TooltipWrapper text="Export">
          <img src={'img/import.svg'} className="playground-button playground-file-button"></img>
        </TooltipWrapper>
      </div>
      <input ref={uploadRef} type="file" accept=".json" onChange={(e) => handleFileChange(e, applyNewGlobalConfig)} />
      <div className="playground-header-button" onClick={() => uploadRef.current.click()}>
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

const handleExport = (chatComponents) => {
  const newGlobalConfig = createGlobalConfig(chatComponents);
  const jsonContent = JSON.stringify(newGlobalConfig, null, 2);
  const blob = new Blob([jsonContent], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'deep-chat-playground.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function createGlobalConfig(chatComponents) {
  const newConfig = {components: []};
  chatComponents.forEach((component) => {
    newConfig.components.push({config: component.ref.current.config, messages: component.ref.current.getMessages()});
  });
  return newConfig;
}

const handleFileChange = (event, applyNewGlobalConfig) => {
  const inputElement = event.target;
  const file = inputElement.files?.[0];
  handleUpload(file, applyNewGlobalConfig);
  inputElement.value = ''; // resetting to prevent Chrome issue of not being able to upload same file twice
};

// WORK - error handling
const handleUpload = (file, applyNewGlobalConfig) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const jsonData = JSON.parse(event.target.result);
      applyNewGlobalConfig(jsonData);
    } catch (error) {
      console.error('Error parsing JSON file:', error);
    }
  };
  reader.readAsText(file);
};
