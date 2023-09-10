import TooltipWrapper from '../../tooltip/playgroundTooltipWrapper';
import InformationModal from './modal/playgroundInformationModal';
import './playgroundInformationButton.css';
import React from 'react';

export default function InformationButton() {
  const [isModalDisplayed, setIsModalDisplayed] = React.useState(false);

  return (
    <div>
      {isModalDisplayed && <InformationModal setIsModalDisplayed={setIsModalDisplayed} />}
      <div className="playground-header-button" onClick={() => setIsModalDisplayed(true)}>
        <TooltipWrapper text="Information">
          <img src={'img/question.svg'} id="playground-information-icon" className="playground-button"></img>
        </TooltipWrapper>
      </div>
    </div>
  );
}
