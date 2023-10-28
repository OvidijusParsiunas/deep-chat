import TooltipWrapper from '../../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function PlaygroundLayoutButton({viewMode, toggleLayout}) {
  function layoutIconClick() {
    toggleLayout();
  }

  return (
    <div id="playground-view-button" className="playground-header-button" onClick={layoutIconClick}>
      <TooltipWrapper text={viewModeToButtonName[viewMode]}>{getIcon(viewMode)}</TooltipWrapper>
    </div>
  );
}

const viewModeToButtonName = {
  1: 'Grid view',
  2: 'Panorama view',
  3: 'Expanded view',
};

function getIcon(viewMode) {
  if (viewMode === 1) {
    return (
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
    );
  }
  if (viewMode === 2) {
    return (
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
    );
  }
  return (
    <svg viewBox="0 0 32 32" style={{transform: 'scale(0.89)'}} version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 29.25h-9.25v-9.25c0-0.414-0.336-0.75-0.75-0.75s-0.75 0.336-0.75 0.75v0 10c0 0.414 0.336 0.75 0.75 0.75h10c0.414 0 0.75-0.336 0.75-0.75s-0.336-0.75-0.75-0.75v0zM30 19.25c-0.414 0-0.75 0.336-0.75 0.75v0 9.25h-9.25c-0.414 0-0.75 0.336-0.75 0.75s0.336 0.75 0.75 0.75v0h10c0.414-0 0.75-0.336 0.75-0.75v0-10c-0-0.414-0.336-0.75-0.75-0.75v0zM12 1.25h-10c-0.414 0-0.75 0.336-0.75 0.75v0 10c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-9.25h9.25c0.414 0 0.75-0.336 0.75-0.75s-0.336-0.75-0.75-0.75v0zM30 1.25h-10c-0.414 0-0.75 0.336-0.75 0.75s0.336 0.75 0.75 0.75v0h9.25v9.25c0 0.414 0.336 0.75 0.75 0.75s0.75-0.336 0.75-0.75v0-10c-0-0.414-0.336-0.75-0.75-0.75v0z"></path>
    </svg>
  );
}
