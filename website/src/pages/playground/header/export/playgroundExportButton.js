import TooltipWrapper from '../../tooltip/playgroundTooltipWrapper';
import ExportModal from './modal/playgroundExportModal';
import React from 'react';

export default function ExportButton({chatComponents, playgroundConfig}) {
  const [isModalDisplayed, setIsModalDisplayed] = React.useState(false);

  return (
    <div>
      {isModalDisplayed && (
        <ExportModal
          setIsModalDisplayed={setIsModalDisplayed}
          chatComponents={chatComponents}
          playgroundConfig={playgroundConfig}
        />
      )}
      <div className="playground-header-button" onClick={() => setIsModalDisplayed(true)}>
        <TooltipWrapper text="Export">
          <img src={'img/import.svg'} className="playground-button playground-file-button"></img>
        </TooltipWrapper>
      </div>
    </div>
  );
}
