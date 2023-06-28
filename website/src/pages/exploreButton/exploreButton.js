import OnVisibleAnimation from '../utils/onVisibleAnimation';
import './exploreButton.css';
import React from 'react';

export default function ExploreButton() {
  return (
    <OnVisibleAnimation beforeClass={'explore-button-collapsed'} afterClass={'explore-button-expanded'} timeoutMS={100}>
      <div id="explore-button-container">
        <a id="explore-button" className="homepage-button" href="docs/styles">
          Explore for more
        </a>
      </div>
    </OnVisibleAnimation>
  );
}
