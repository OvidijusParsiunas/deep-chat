import huggingFaceLogo from '/img/huggingFaceLogo.png';
import lofiBackground from '/img/lofi-background.webp';
import blueBackground from '/img/blue-background.jpg';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import bird from '/img/bird.jpeg';
import city from '/img/city.jpeg';
import './preloadImages.css';
import React from 'react';

// SVGs file cannot be preloaded and should be inlined
// If this still does not work - simply use: https://docusaurus.io/docs/api/docusaurus-config#headTags
// this is an optimization approach to stop images rendering whilst they are being displayed
export default function PreloadImages() {
  const [displayContentImages, setDisplayContentImages] = React.useState(false);
  const [displayBackgroundImages, setDisplayBackgroundImages] = React.useState(false);

  // executed sequentially from what is displayed first
  React.useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        setDisplayContentImages(true);
        setTimeout(() => {
          if (isMounted) setDisplayBackgroundImages(true);
        }, 2000);
      }
    }, 1000);
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="preload-image">
        <img src={huggingFaceLogo} />
      </div>
      <div className="preload-image">
        <img src={openAILogo} />
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
      {displayContentImages && (
        <div>
          <div className="preload-image">
            <img src={bird} />
          </div>
          <div className="preload-image">
            <img src={city} />
          </div>
        </div>
      )}
      {displayBackgroundImages && (
        <div>
          <div className="preload-image">
            <img src={blueBackground} />
          </div>
          <div className="preload-image">
            <img src={lofiBackground} />
          </div>
        </div>
      )}
    </div>
  );
}
