import TooltipWrapper from '../../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function PlaygroundLayoutButton({isGrid, toggleLayout}) {
  // tracking state here as the icon does not immediately update with isGrid
  const [isGridI, setIsGridI] = React.useState(isGrid);

  function layoutIconClick() {
    toggleLayout();
    setIsGridI((state) => !state);
  }

  return (
    <div id="playground-view-button" className="playground-header-button" onClick={layoutIconClick}>
      <TooltipWrapper text={isGridI ? 'Panorama view' : 'Grid view'}>
        {isGridI ? (
          <svg
            className="playground-button"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="#000000"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="miter"
          >
            <line x1="1" x2="23" y1="4" y2="4" />
            <rect x="2" y="8" width="8" height="8"></rect>
            <rect x="14" y="8" width="8" height="8"></rect>
            <line x1="1" x2="23" y1="20" y2="20" />
          </svg>
        ) : (
          <svg
            className="playground-button"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="#000000"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="miter"
          >
            <rect x="2" y="2" width="8" height="8" rx="0"></rect>
            <rect x="2" y="14" width="8" height="8" rx="0"></rect>
            <rect x="14" y="2" width="8" height="8" rx="0"></rect>
            <rect x="14" y="14" width="8" height="8" rx="0"></rect>
          </svg>
        )}
      </TooltipWrapper>
    </div>
  );
}
