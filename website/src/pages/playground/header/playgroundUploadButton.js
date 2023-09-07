import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function UploadButton({applyNewPlaygroundConfig}) {
  const uploadRef = React.useRef(null);

  const handleFileChange = (event) => {
    const inputElement = event.target;
    const file = inputElement.files?.[0];
    handleUpload(file);
    inputElement.value = ''; // resetting to prevent Chrome issue of not being able to upload same file twice
  };

  // WORK - error handling
  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        applyNewPlaygroundConfig(jsonData);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="playground-header-button" onClick={() => uploadRef.current.click()}>
      <input ref={uploadRef} style={{display: 'none'}} type="file" accept=".json" onChange={handleFileChange} />
      <TooltipWrapper text="Upload">
        <img src={'img/export.svg'} className="playground-button playground-file-button"></img>
      </TooltipWrapper>
    </div>
  );
}
