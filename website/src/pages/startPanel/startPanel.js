import DeepChatBrowser from '../../components/table/deepChatBrowser';
import huggingFaceLogo from '/img/huggingFaceLogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import React from 'react';
import './startPanel.css';

const Logos = React.forwardRef((_, ref) => {
  return (
    <div
      id="start-panel-logos"
      className={'start-panel-logos-left start-panel-logos-collapsed start-panel-logos-middle'}
      ref={ref}
    >
      <div className="start-panel-logo">
        <a href="docs/existingServices/HuggingFace" target="_blank">
          <img src={huggingFaceLogo} width="60" />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/existingServices/OpenAI" target="_blank">
          <img src={openAILogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/existingServices/Cohere" target="_blank">
          <img src={cohereLogo} width="60" style={{marginTop: '1xpx'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/existingServices/Azure" target="_blank">
          <img src={azureLogo} width="42" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div className="start-panel-logo">
        <a href="docs/existingServices/AssemblyAI" target="_blank">
          <img src={assemblyAILogo} width="35" style={{marginTop: '8px'}} />
        </a>
      </div>
    </div>
  );
});

function animate(component, logos, messageLine, messageBubble) {
  component.classList.add('start-panel-component-left');
  logos.classList.add('start-panel-logos-right');
  messageLine.classList.add('message-line-long');
  setTimeout(() => {
    logos.classList.add('start-panel-logos-expanded');
    logos.classList.add('logos-top');
    messageBubble.classList.add('message-bubble-animation');
  }, 1500);
  setTimeout(() => {
    messageBubble.classList.add('displayed');
  }, 1000);
}

function ComponentPanel() {
  const logos = React.useRef(null);
  const component = React.useRef(null);
  const messageBubble = React.useRef(null);
  const messageLine = React.useRef(null);
  setTimeout(() => animate(component.current, logos.current, messageLine.current, messageBubble.current), 1500);
  return (
    <div id="start-panel-animation-content-container">
      <div id="start-panel-component" ref={component} className={'start-panel-component-center'}>
        <DeepChatBrowser
          existingService={{demo: true}}
          initialMessages={[
            {text: 'What is Deep Chat?', role: 'user'},
            {text: 'A framework agnostic chat component.', role: 'ai'},
            {text: 'What exactly can it be used for?', role: 'user'},
            {text: 'It can provide a rich chat experience for any API.', role: 'ai'},
          ]}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            zIndex: 10,
          }}
          stream="true"
        ></DeepChatBrowser>
      </div>
      <Logos ref={logos}></Logos>
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
    <div id="start-panel">
      <div id="start-panel-content">
        <HeaderPanel></HeaderPanel>
        <ComponentPanel></ComponentPanel>
      </div>
    </div>
  );
}
