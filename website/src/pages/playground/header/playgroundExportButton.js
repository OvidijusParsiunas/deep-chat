import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function ExportButton({chatComponents}) {
  const handleExport = () => {
    const newPlaygroundConfig = createPlaygroundConfig();
    const jsonContent = JSON.stringify(newPlaygroundConfig, null, 2);
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

  function createPlaygroundConfig() {
    const newConfig = {components: []};
    chatComponents.forEach((component) => {
      newConfig.components.push({connect: component.ref.current.connect, messages: component.ref.current.getMessages()});
    });
    return newConfig;
  }

  return (
    <div className="playground-header-button" onClick={handleExport}>
      <TooltipWrapper text="Export">
        <img src={'img/import.svg'} className="playground-button playground-file-button"></img>
      </TooltipWrapper>
    </div>
  );
}
