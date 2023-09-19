import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function Cog() {
  return (
    <div className="playground-header-button">
      <TooltipWrapper text="Deep Chat does not record or store any data">
        <img src="/img/cog.svg" className="playground-button"></img>
      </TooltipWrapper>
    </div>
  );
}
