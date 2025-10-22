import DeepChatBrowser from '../../components/table/deepChatBrowser';
import SmallScreenPanel from '../smallScreen/smallScreen';
import StartPanelParticles from './startPanelParticles';
import DeepChatLogo from '../smallScreen/deepChatLogo';
import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import {useColorMode} from '@docusaurus/theme-common';
import assemblyAILogo from '/img/assemblyAILogo.png';
import perplexityLogo from '/img/perplexityLogo.png';
import openRouterLogo from '/img/openRouterLogo.png';
import BrowserOnly from '@docusaurus/BrowserOnly';
import togetherLogo from '/img/togetherLogo.webp';
import deepSeekLogo from '/img/deepSeekLogo.png';
import bigModelLogo from '/img/bigModelLogo.png';
import mistralLogo from '/img/mistralLogo.png';
import minimaxLogo from '/img/minimaxLogo.png';
import geminiLogo from '/img/geminiLogo.webp';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import claudeLogo from '/img/claudeLogo.png';
import ollamaLogo from '/img/ollamaLogo.png';
import azureLogo from '/img/azureLogo.png';
import groqLogo from '/img/groqLogo.png';
import kimiLogo from '/img/kimiLogo.png';
import qwenLogo from '/img/qwenLogo.png';
import xLogo from '/img/xLogo.webp';
import React from 'react';
import './startPanel.css';

const Logos1 = React.forwardRef((_, ref) => {
  return (
    <div
      id="start-panel-logos"
      className={'start-panel-not-visible start-panel-logos-left start-panel-logos-collapsed start-panel-logos-middle'}
      ref={ref}
      style={{zIndex: 9}}
    >
      <div className="start-panel-logo">
        <a href="docs/directConnection/Claude" target="_blank">
          <img src={claudeLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Gemini" target="_blank">
          <img src={geminiLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Ollama" target="_blank">
          <img src={ollamaLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Groq" target="_blank">
          <img src={groqLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/OpenAI" target="_blank">
          <img src={openAILogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
    </div>
  );
});

const Logos2 = React.forwardRef((_, ref) => {
  return (
    <div
      id="start-panel-logos"
      className={'start-panel-logos-left start-panel-logos-expanded logos-top start-panel-logos-middle'}
      ref={ref}
      style={{zIndex: 8, visibility: 'hidden'}}
    >
      <div className="start-panel-logo">
        <a href="docs/directConnection/HuggingFace" target="_blank">
          <img src={huggingFaceLogo} width="60" />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Cohere" target="_blank">
          <img src={cohereLogo} width="60" style={{marginTop: '1px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Perplexity" target="_blank">
          <img src={perplexityLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/OpenRouter" target="_blank">
          <img src={openRouterLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>

      <div className="start-panel-logo">
        <a href="docs/directConnection/Mistral" target="_blank">
          <img src={mistralLogo} width="40" style={{marginTop: '12px'}} />
        </a>
      </div>
    </div>
  );
});

const Logos3 = React.forwardRef((_, ref) => {
  return (
    <div
      id="start-panel-logos"
      className={'start-panel-logos-left start-panel-logos-expanded logos-top start-panel-logos-middle'}
      ref={ref}
      style={{zIndex: 7, visibility: 'hidden'}}
    >
      <div className="start-panel-logo">
        <a href="docs/directConnection/DeepSeek" target="_blank">
          <img src={deepSeekLogo} width="42" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/BigModel" target="_blank">
          <img src={bigModelLogo} width="35" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Kimi" target="_blank">
          <img src={kimiLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/MiniMax" target="_blank">
          <img src={minimaxLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Qwen" target="_blank">
          <img src={qwenLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
    </div>
  );
});

const Logos4 = React.forwardRef((_, ref) => {
  return (
    <div
      id="start-panel-logos"
      className={'start-panel-logos-left start-panel-logos-expanded logos-top start-panel-logos-middle'}
      ref={ref}
      style={{zIndex: 6, visibility: 'hidden'}}
    >
      <div className="start-panel-logo">
        <a href="docs/directConnection/X" target="_blank">
          <img src={xLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Together" target="_blank">
          <img src={togetherLogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/StabilityAI" target="_blank">
          <img src={stabilityAILogo} width="50" style={{marginTop: '3px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/Azure" target="_blank">
          <img src={azureLogo} width="42" style={{marginTop: '8px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/directConnection/AssemblyAI" target="_blank">
          <img src={assemblyAILogo} width="35" style={{marginTop: '9px'}} />
        </a>
      </div>
    </div>
  );
});

function animate(component, logos1, logos2, logos3, logos4, messageLine, messageBubble) {
  if (!component) return;
  component.classList.add('start-panel-component-left');
  // Only first column moves right initially
  logos1.style.left = '495px';
  messageLine.classList.add('message-line-long');

  // First column expands after moving right
  setTimeout(() => {
    logos1.classList.add('start-panel-logos-expanded');
    logos1.classList.add('logos-top');
  }, 1500);

  // Second column slides out from behind first (already expanded)
  setTimeout(() => {
    logos2.classList.add('logos-slide-visible');
  }, 2400);

  // Third column slides out from behind second (already expanded)
  setTimeout(() => {
    logos3.classList.add('logos-slide-visible');
  }, 3300);

  setTimeout(() => {
    messageBubble.classList.add('message-bubble-animation');
  }, 5400);

  // Fourth column slides out from behind third (already expanded)
  setTimeout(() => {
    logos4.classList.add('logos-slide-visible');
  }, 4200);

  setTimeout(() => {
    messageBubble.classList.add('displayed');
  }, 1000);

  // Sparkle animation after all logos are visible
  setTimeout(() => {
    sparkleAnimation([logos1, logos2, logos3, logos4]);
    // Start random sparkle repeats
    scheduleRandomSparkles([logos1, logos2, logos3, logos4]);
  }, 5200);
}

function sparkleAnimation(logoColumns) {
  const sparkleDelay = 100; // milliseconds between each sparkle

  // First wave: top-left to bottom-right
  for (let diagonal = 0; diagonal < 9; diagonal++) {
    // 5 rows + 4 columns - 1
    setTimeout(() => {
      logoColumns.forEach((column, columnIndex) => {
        const logos = column.querySelectorAll('.start-panel-logo');
        const rowIndex = diagonal - columnIndex;

        if (rowIndex >= 0 && rowIndex < logos.length) {
          const logo = logos[rowIndex];
          logo.classList.add('sparkle-animation');

          // Remove the class after animation completes
          setTimeout(() => {
            logo.classList.remove('sparkle-animation');
          }, 250);
        }
      });
    }, diagonal * sparkleDelay);
  }

  // Second wave: bottom-left to top-right (starts after first wave completes)
  const firstWaveDelay = 9 * sparkleDelay + 250; // Wait for first wave + small gap
  for (let diagonal = 0; diagonal < 9; diagonal++) {
    setTimeout(() => {
      logoColumns.forEach((column, columnIndex) => {
        const logos = column.querySelectorAll('.start-panel-logo');
        const rowIndex = logos.length - 1 - diagonal + columnIndex; // Bottom-left to top-right

        if (rowIndex >= 0 && rowIndex < logos.length) {
          const logo = logos[rowIndex];
          logo.classList.add('sparkle-animation');

          // Remove the class after animation completes
          setTimeout(() => {
            logo.classList.remove('sparkle-animation');
          }, 250);
        }
      });
    }, firstWaveDelay + diagonal * sparkleDelay);
  }
}

function scheduleRandomSparkles(logoColumns) {
  function scheduleNext() {
    // Random delay between 5-20 seconds
    const randomDelay = Math.random() * 15000 + 5000;

    setTimeout(() => {
      sparkleAnimation(logoColumns);
      scheduleNext(); // Schedule the next one
    }, randomDelay);
  }

  scheduleNext();
}

function displayLogos(logos1) {
  if (!logos1) return;
  setTimeout(() => {
    logos1.classList.add('start-panel-visible');
  }, 20);
}

function ComponentPanel() {
  const {colorMode} = useColorMode();

  const logos1 = React.useRef(null);
  const logos2 = React.useRef(null);
  const logos3 = React.useRef(null);
  const logos4 = React.useRef(null);
  const component = React.useRef(null);
  const messageBubble = React.useRef(null);
  const messageLine = React.useRef(null);

  // Set CSS custom properties based on color mode
  React.useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'dark') {
      root.style.setProperty('--sparkle-base-color', 'white');
      root.style.setProperty('--sparkle-highlight-color', '#f5f5dc');
      root.style.setProperty('--sparkle-glow-color', 'rgba(245, 245, 220, 0.5)');
    } else {
      root.style.setProperty('--sparkle-base-color', 'white');
      root.style.setProperty('--sparkle-highlight-color', '#f8f8e7');
      root.style.setProperty('--sparkle-glow-color', 'rgba(245, 245, 220, 0.4)');
    }
  }, [colorMode]);

  setTimeout(() => displayLogos(logos1.current), 350);
  setTimeout(
    () =>
      animate(
        component.current,
        logos1.current,
        logos2.current,
        logos3.current,
        logos4.current,
        messageLine.current,
        messageBubble.current
      ),
    1450
  );
  return (
    <div id="start-panel-animation-content-container">
      <div id="start-panel-component" ref={component} className={'start-panel-component-center'}>
        <DeepChatBrowser
          demo={true}
          history={[
            {text: 'What is Deep Chat?', role: 'user'},
            {text: 'A framework agnostic chat component.', role: 'ai'},
            {text: 'What exactly can it be used for?', role: 'user'},
            {text: 'Add it to your website to connect to AI APIs.', role: 'ai'},
          ]}
          style={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            border: '1px solid white',
            zIndex: 10,
          }}
          connect={{stream: true}}
        ></DeepChatBrowser>
      </div>
      <Logos1 ref={logos1}></Logos1>
      <div style={{position: 'absolute', top: 0, left: 100}}>
        <Logos2 ref={logos2}></Logos2>
      </div>
      <div style={{position: 'absolute', top: 0, left: 170}}>
        <Logos3 ref={logos3}></Logos3>
      </div>
      <div style={{position: 'absolute', top: 0, left: 240}}>
        <Logos4 ref={logos4}></Logos4>
      </div>
      <div id="message-line" className={'message-line-short'} ref={messageLine}></div>
      <div id="message-bubble" className={'not-displayed'} ref={messageBubble}></div>
    </div>
  );
}

export function HeaderPanel() {
  return (
    <div>
      <h1 id="start-panel-header" className="header-font">
        Deep Chat
      </h1>
      {/* <h1 id="start-panel-sub-header">One chatbot to rule them all</h1> */}
      {/* <h1 id="start-panel-sub-header">Framework agnostic chat component to power AI services of tomorrow</h1> */}
      {/* <h1 id="start-panel-sub-header">Powering AI services of tomorrow</h1> */}
      <h1 id="start-panel-sub-header">Built to power AI services of tomorrow</h1>
    </div>
  );
}

export default function StartPanel() {
  return (
    <BrowserOnly>
      {() => {
        return (
          <div id="start-panel">
            <StartPanelParticles></StartPanelParticles>
            <div id="start-panel-content">
              <HeaderPanel></HeaderPanel>
              <ComponentPanel></ComponentPanel>
              <SmallScreenPanel></SmallScreenPanel>
              <DeepChatLogo></DeepChatLogo>
            </div>
          </div>
        );
      }}
    </BrowserOnly>
  );
}
