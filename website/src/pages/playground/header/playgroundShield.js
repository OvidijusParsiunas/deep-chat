import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function Shield() {
  return (
    <div className="playground-header-button">
      <TooltipWrapper text="Deep Chat does not record or store any data">
        <img src="/img/shield.svg" className="playground-button"></img>
      </TooltipWrapper>
    </div>
  );
}
