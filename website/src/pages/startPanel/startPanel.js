import DeepChatBrowser from '../../components/table/deepChatBrowser';
import huggingFaceLogo from '/img/huggingFaceLogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import React from 'react';
import './startPanel.css';

export function LeftPanel() {
  return (
    <div id="start-panel-left">
      <h1 id="start-colored-header" className="header-font" style={{color: '#003064'}}>
        Deep Chat
      </h1>
      {/* <h1 id="start-sub-header">One chatbot to rule them all</h1> */}
      {/* <h1 id="start-sub-header">Framework agnostic chat component to power AI services of tomorrow</h1> */}
      {/* <h1 id="start-sub-header">Powering AI services of tomorrow</h1> */}
      <h1 id="start-sub-header">Built to power AI services</h1>
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

function ComponentPanel() {
  const logos = React.useRef(null);
  const component = React.useRef(null);
  const messageBubble = React.useRef(null);
  const messageLine = React.useRef(null);
  setTimeout(() => {
    logos.current.classList.add('regular-layout');
    logos.current.classList.add('top-position');
  }, 3500);
  setTimeout(() => {
    messageBubble.current.classList.add('displayed');
    messageBubble.current.classList.add('message-animation');
  }, 3500);
  setTimeout(() => {
    component.current.classList.add('component-left-position');
    logos.current.classList.add('start-panel-logos-right-position');
    messageLine.current.classList.add('message-line-long');
  }, 2000);
  return (
    <div style={{position: 'relative', marginTop: '60px', width: '650px', marginLeft: 'auto', marginRight: 'auto'}}>
      <div ref={component} className={'start-panel-component component-center-position'}>
        <DeepChatBrowser
          existingService={{demo: true}}
          initialMessages={[
            {text: 'Hey, how are you?', role: 'user'},
            {text: 'I am doing great, how about you?', role: 'ai'},
            {text: 'What is the meaning of life?', role: 'user'},
            {
              text: 'This depends on the person.',
              role: 'ai',
            },
          ]}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
          }}
        ></DeepChatBrowser>
      </div>

      <div id="start-panel-logos" className={'start-panel-logos-position collapsed-layout center-position'} ref={logos}>
        <div className="logo-box">
          <img src={huggingFaceLogo} width="60" />
        </div>
        <div className="logo-box">
          <img src={openAILogo} width="40" style={{marginTop: '7px'}} />
        </div>
        <div className="logo-box">
          <img src={cohereLogo} width="60" style={{marginTop: '1xpx'}} />
        </div>
        <div className="logo-box">
          <img src={azureLogo} width="42" style={{marginTop: '7px'}} />
        </div>
        <div className="logo-box">
          <img src={assemblyAILogo} width="35" style={{marginTop: '8px'}} />
        </div>
      </div>
      <div id="message-line" className={'message-line-short'} ref={messageLine}></div>
      <div id="message-bubble" ref={messageBubble} className={'not-displayed'}></div>
    </div>
  );
}

export function HeaderPanel() {
  return (
    <div>
      <h1 id="start-colored-header" className="header-font" style={{color: '#003064'}}>
        Deep Chat
      </h1>
      <h1 id="start-sub-header" style={{marginTop: '-5px', fontWeight: 600}}>
        Built to power AI services of tomorrow
      </h1>
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
