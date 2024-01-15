import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import WebModelLogo from '/img/chip.svg';
import Flash from '/img/flash.svg';
import './preloadImages.css';
import React from 'react';

// SVGs file cannot be preloaded and should be inlined
// If this still does not work - simply use: https://docusaurus.io/docs/api/docusaurus-config#headTags
// this is an optimization approach to stop images rendering whilst they are being displayed
export default function PreloadPlaygroundImages() {
  const [displayServiceImages, setDisplayServiceImages] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        setDisplayServiceImages(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {displayServiceImages && (
        <div>
          <div className="preload-image">
            <Flash />
          </div>
          <div className="preload-image">
            <WebModelLogo />
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
    </div>
  );
}
