import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import springBootLogo from '/img/springBootLogo.png';
import vanillaJSLogo from '/img/vanillaJSLogo.png';
import expressJSLogo from '/img/expressLogo.png';
import angularLogo from '/img/angularLogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import svelteLogo from '/img/svelteLogo.png';
import azureLogo from '/img/azureLogo.png';
import nestJSLogo from '/img/nestLogo.png';
import flaskLogo from '/img/flaskLogo.png';
import reactLogo from '/img/reactLogo.png';
import solidLogo from '/img/solidLogo.png';
import nextLogo from '/img/nextLogo.png';
import vueLogo from '/img/vueLogo.png';
import goLogo from '/img/goLogo.png';
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
          <div className="preload-image">
            <img src={stabilityAILogo} />
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
