import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import perplexityLogo from '/img/perplexityLogo.png';
import openRouterLogo from '/img/openRouterLogo.png';
import springBootLogo from '/img/springBootLogo.png';
import vanillaJSLogo from '/img/vanillaJSLogo.png';
import togetherLogo from '/img/togetherLogo.webp';
import deepSeekLogo from '/img/deepSeekLogo.png';
import bigModelLogo from '/img/bigModelLogo.png';
import expressJSLogo from '/img/expressLogo.png';
import mistralLogo from '/img/mistralLogo.png';
import minimaxLogo from '/img/minimaxLogo.png';
import angularLogo from '/img/angularLogo.png';
import geminiLogo from '/img/geminiLogo.webp';
import claudeLogo from '/img/claudeLogo.png';
import ollamaLogo from '/img/ollamaLogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import svelteLogo from '/img/svelteLogo.png';
import azureLogo from '/img/azureLogo.png';
import nestJSLogo from '/img/nestLogo.png';
import flaskLogo from '/img/flaskLogo.png';
import reactLogo from '/img/reactLogo.png';
import solidLogo from '/img/solidLogo.png';
import groqLogo from '/img/groqLogo.png';
import kimiLogo from '/img/kimiLogo.png';
import qwenLogo from '/img/qwenLogo.png';
import nextLogo from '/img/nextLogo.png';
import vueLogo from '/img/vueLogo.png';
import goLogo from '/img/goLogo.png';
import xLogo from '/img/xLogo.webp';
import './preloadImages.css';
import React from 'react';

// SVGs file cannot be preloaded and should be inlined
export default function PreloadStartImages() {
  const [displayServiceLogos, setDisplayFrameworkLogos] = React.useState(false);
  const [displayServerLogos, setDisplayServerLogos] = React.useState(false);

  // executed sequentially from what is displayed first
  React.useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        setDisplayFrameworkLogos(true);
        setTimeout(() => {
          if (isMounted) setDisplayServerLogos(true);
        }, 200);
      }
    }, 200);
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="preload-image">
        <img src={vanillaJSLogo} />
      </div>
      <div className="preload-image">
        <img src={angularLogo} />
      </div>
      <div className="preload-image">
        <img src={svelteLogo} />
      </div>
      <div className="preload-image">
        <img src={reactLogo} />
      </div>
      <div className="preload-image">
        <img src={solidLogo} />
      </div>
      <div className="preload-image">
        <img src={vueLogo} />
      </div>
      {displayServiceLogos && (
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
        </div>
      )}
      {displayServerLogos && (
        <div>
          <div className="preload-image">
            <img src={springBootLogo} />
          </div>
          <div className="preload-image">
            <img src={expressJSLogo} />
          </div>
          <div className="preload-image">
            <img src={nestJSLogo} />
          </div>
          <div className="preload-image">
            <img src={flaskLogo} />
          </div>
          <div className="preload-image">
            <img src={nextLogo} />
          </div>
          <div className="preload-image">
            <img src={goLogo} />
          </div>
        </div>
      )}
    </div>
  );
}
