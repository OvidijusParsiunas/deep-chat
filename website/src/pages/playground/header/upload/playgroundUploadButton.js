import TooltipWrapper from '../../tooltip/playgroundTooltipWrapper';
import UploadModal from './modal/playgroundUploadModal';
import React from 'react';

export default function UploadButton({applyNewPlaygroundConfig}) {
  const [isModalDisplayed, setIsModalDisplayed] = React.useState(false);

  return (
    <div>
      {isModalDisplayed && (
        <UploadModal setIsModalDisplayed={setIsModalDisplayed} applyNewPlaygroundConfig={applyNewPlaygroundConfig} />
      )}
      <div className="playground-header-button" onClick={() => setIsModalDisplayed(true)}>
        <TooltipWrapper text="Upload">
          <img src={'img/export.svg'} className="playground-button playground-file-button"></img>
        </TooltipWrapper>
      </div>
    </div>
  );
}
