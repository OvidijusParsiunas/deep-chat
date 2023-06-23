import DeepChatBrowser from '../../components/table/deepChatBrowser';
import huggingFaceLogo from '/img/huggingFaceLogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import React from 'react';
import './startPanel.css';

function RightPanel() {
  return (
    <div id="start-panel-right" style={{position: 'relative', height: '400px', marginTop: '260px'}}>
      <div id="start-panel-right-table" style={{display: 'flex'}}>
        <div style={{position: 'absolute', width: '100px', zIndex: 2}}>
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
              left: '20px',
            }}
            // messageStyles={{
            //   default: {
            //     user: {
            //       bubble: {
            //         boxShadow: '0 0.5rem 1rem 0 rgb(34 69 181 / 32%)',
            //       },
            //     },
            //     ai: {
            //       bubble: {
            //         boxShadow: '0px 0.5rem 1rem 0px rgb(75 77 84 / 32%) ',
            //       },
            //     },
            //   },
            // }}
          ></DeepChatBrowser>
        </div>
        <div style={{position: 'absolute', left: '510px', paddingTop: '10px', zIndex: 1}}>
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
        <div style={{position: 'absolute', top: '200px', left: '300px', width: '250px'}}>
          <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="300" y2="0" stroke="#DBDBDB" strokeWidth="5" />
          </svg>
        </div>
        <div
          id="message-bubble"
          style={{
            height: '15px',
            width: '15px',
            borderRadius: '15px',
            backgroundColor: '#e0e0e0',
            position: 'absolute',
            top: '193px',
            left: '330px',
          }}
        ></div>
      </div>
    </div>
  );
}

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

export function TopPanel() {
  return (
    <div style={{position: 'absolute', top: '70px', left: '160px'}}>
      <div id="start-panel-top" style={{width: '900px', textAlign: 'center'}}>
        <h1 id="start-colored-header" className="header-font" style={{color: '#003064'}}>
          Deep Chat
        </h1>
        <h1 id="start-sub-header" style={{marginTop: '-5px', fontWeight: 600}}>
          Built to power AI services of tomorrow
        </h1>
      </div>
    </div>
  );
}

export default function StartPanel() {
  return (
    <div id="start-panel">
      <div id="start-panel-content">
        {/* <LeftPanel></LeftPanel> */}
        <TopPanel></TopPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
