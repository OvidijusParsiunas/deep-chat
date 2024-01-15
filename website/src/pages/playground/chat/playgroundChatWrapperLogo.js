import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import WebModelLogo from '/img/chip.svg';
import './playgroundChatWrapper.css';
import Flash from '/img/flash.svg';
import React from 'react';

function Icon({connect}) {
  if (connect) {
    if (connect.custom) {
      return <Flash width="19" style={{paddingTop: '5px', marginRight: '6px', marginLeft: '-10px'}} />;
    }
    if (connect.cohere) {
      return <img src={cohereLogo} width="26" style={{paddingTop: '1.5px', marginLeft: '-1px', marginRight: '3px'}} />;
    }
    if (connect.azure) {
      return <img src={azureLogo} width="20.5" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.huggingFace) {
      return <img src={huggingFaceLogo} width="24" style={{paddingTop: '2.5px', marginRight: '6px'}} />;
    }
    if (connect.stabilityAI) {
      return <img src={stabilityAILogo} width="19" style={{paddingTop: '4.8px', marginRight: '6px'}} />;
    }
    if (connect.assemblyAI) {
      return <img src={assemblyAILogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.openAI) {
      return (
        <img
          src={openAILogo}
          width="17"
          style={{paddingTop: '6px', marginRight: '8px'}}
          className="adaptive-logo-filter"
        />
      );
    }
    if (connect.webModel) {
      return (
        <WebModelLogo
          width="18"
          style={{paddingTop: '5px', marginRight: '6px', marginLeft: '-10px'}}
          className="adaptive-logo-filter"
        />
      );
    }
  }
  return (
    <Flash
      width="19"
      style={{
        paddingTop: '5px',
        marginRight: '6px',
        marginLeft: '-10px',
        transform: 'scale(1.1)',
        filter:
          'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(926%) hue-rotate(322deg) brightness(97%) contrast(91%)',
      }}
    />
  );
}

export default function Logo({connect}) {
  return (
    <div>
      <Icon connect={connect}></Icon>
    </div>
  );
}
