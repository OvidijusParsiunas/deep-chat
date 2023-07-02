import FadeInContent from '../pages/utils/fadeInContent';
import React from 'react';
import './startPanel.css';

// used on the startPanel.js file
function RightPanel() {
  return (
    <div id="start-panel-right">
      <div id="start-panel-right-table"></div>
    </div>
  );
}

export function LeftPanel() {
  return (
    <div id="start-panel-left">
      <h1 id="start-panel-header">Active Table</h1>
      <h1 id="start-panel-sub-header">Framework agnostic table component for editable data experience</h1>
      <div id="start-buttons">
        <a className="homepage-button start-button" href="docs/installation">
          Installation
        </a>
        <a className="homepage-button start-button" href="docs/table">
          Explore API
        </a>
      </div>
    </div>
  );
}

export default function StartPanel() {
  const contentRef = React.useRef(null);
  return (
    <div id="start-panel">
      <div ref={contentRef} id="start-panel-content" className="invisible-component">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
        <FadeInContent contentRef={contentRef}></FadeInContent>
      </div>
    </div>
  );
}
