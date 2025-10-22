import huggingFaceLogo from '/img/huggingFaceLogo.png';
import lofiBackground from '/img/lofi-background.webp';
import stabilityAILogo from '/img/stabilityAILogo.png';
import blueBackground from '/img/blue-background.jpg';
import assemblyAILogo from '/img/assemblyAILogo.png';
import perplexityLogo from '/img/perplexityLogo.png';
import openRouterLogo from '/img/openRouterLogo.png';
import togetherLogo from '/img/togetherLogo.webp';
import deepSeekLogo from '/img/deepSeekLogo.png';
import bigModelLogo from '/img/bigModelLogo.png';
import mistralLogo from '/img/mistralLogo.png';
import minimaxLogo from '/img/minimaxLogo.png';
import geminiLogo from '/img/geminiLogo.webp';
import claudeLogo from '/img/claudeLogo.png';
import ollamaLogo from '/img/ollamaLogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import groqLogo from '/img/groqLogo.png';
import kimiLogo from '/img/kimiLogo.png';
import qwenLogo from '/img/qwenLogo.png';
import xLogo from '/img/xLogo.webp';
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
        <img src={claudeLogo} />
      </div>
      <div className="preload-image">
        <img src={geminiLogo} />
      </div>
      <div className="preload-image">
        <img src={ollamaLogo} />
      </div>
      <div className="preload-image">
        <img src={groqLogo} />
      </div>
      <div className="preload-image">
        <img src={openAILogo} />
      </div>
      <div className="preload-image">
        <img src={huggingFaceLogo} />
      </div>
      <div className="preload-image">
        <img src={cohereLogo} />
      </div>
      <div className="preload-image">
        <img src={perplexityLogo} />
      </div>
      <div className="preload-image">
        <img src={openRouterLogo} />
      </div>
      <div className="preload-image">
        <img src={mistralLogo} />
      </div>
      <div className="preload-image">
        <img src={deepSeekLogo} />
      </div>
      <div className="preload-image">
        <img src={bigModelLogo} />
      </div>
      <div className="preload-image">
        <img src={kimiLogo} />
      </div>
      <div className="preload-image">
        <img src={minimaxLogo} />
      </div>
      <div className="preload-image">
        <img src={qwenLogo} />
      </div>
      <div className="preload-image">
        <img src={xLogo} />
      </div>
      <div className="preload-image">
        <img src={togetherLogo} />
      </div>
      <div className="preload-image">
        <img src={stabilityAILogo} />
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
