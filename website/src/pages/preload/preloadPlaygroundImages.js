import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import Flash from '/img/flash.svg';
import './preloadImages.css';
import React from 'react';

// If this still does not work - simply use: https://docusaurus.io/docs/api/docusaurus-config#headTags
// this is an optimization approach to stop images rendering whilst they are being displayed
export default function PreloadPlaygroundImages() {
  const [displayServiceImages, setDisplayServiceImages] = React.useState(false);
  const [displayHiddenImages, setDisplayHiddenImages] = React.useState(false);

  // executed sequentially from what is displayed first
  React.useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        setDisplayServiceImages(true);
        setTimeout(() => {
          if (isMounted) {
            setDisplayHiddenImages(true);
          }
        }, 1000);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="preload-image">
        <img src="img/connect.svg" />
      </div>
      <div className="preload-image">
        <img src="img/shield.svg" />
      </div>
      <div className="preload-image">
        <img src="img/video.svg" />
      </div>
      <div className="preload-image">
        <img src="img/layout-grid.svg" />
      </div>
      <div className="preload-image">
        <img src="img/question.svg" />
      </div>
      <div className="preload-image">
        <img src="img/plus.svg" />
      </div>
      {displayServiceImages && (
        <div>
          <div className="preload-image">
            <Flash />
          </div>
          <div className="preload-image">
            <img src={openAILogo} />
          </div>
          <div className="preload-image">
            <img src={huggingFaceLogo} />
          </div>
          <div className="preload-image">
            <img src={stabilityAILogo} />
          </div>
          <div className="preload-image">
            <img src={cohereLogo} />
          </div>
          <div className="preload-image">
            <img src={azureLogo} />
          </div>
          <div className="preload-image">
            <img src={assemblyAILogo} />
          </div>
        </div>
      )}
      {displayHiddenImages && (
        <div>
          <div className="preload-image">
            <img src="img/layout-panorama.svg" />
          </div>
          <div className="preload-image">
            <img src="img/configure-2.svg" />
          </div>
          <div className="preload-image">
            <img src="img/clear-messages.svg" />
          </div>
          <div className="preload-image">
            <img src="img/clone.svg" />
          </div>
          <div className="preload-image">
            <img src="img/bin.svg" />
          </div>
        </div>
      )}
    </div>
  );
}
