import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openRouterLogo from '/img/openRouterLogo.png';
import perplexityLogo from '/img/perplexityLogo.png';
import togetherLogo from '/img/togetherLogo.webp';
import bigModelLogo from '/img/bigModelLogo.png';
import deepSeekLogo from '/img/deepSeekLogo.png';
import minimaxLogo from '/img/minimaxLogo.png';
import mistralLogo from '/img/mistralLogo.png';
import geminiLogo from '/img/geminiLogo.webp';
import claudeLogo from '/img/claudeLogo.png';
import cohereLogo from '/img/cohereLogo.png';
import ollamaLogo from '/img/ollamaLogo.png';
import openAILogo from '/img/openAILogo.png';
import azureLogo from '/img/azureLogo.png';
import groqLogo from '/img/groqLogo.png';
import kimiLogo from '/img/kimiLogo.png';
import qwenLogo from '/img/qwenLogo.png';
import WebModelLogo from '/img/chip.svg';
import './playgroundChatWrapper.css';
import xLogo from '/img/xLogo.webp';
import Flash from '/img/flash.svg';
import React from 'react';

function Icon({connect}) {
  if (connect) {
    if (connect.custom) {
      return <Flash width="19" style={{paddingTop: '5px', marginRight: '6px', marginLeft: '-10px'}} />;
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
    if (connect.assemblyAI) {
      return <img src={assemblyAILogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.azure) {
      return <img src={azureLogo} width="20.5" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.bigModel) {
      return <img src={bigModelLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.claude) {
      return <img src={claudeLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.cohere) {
      return <img src={cohereLogo} width="26" style={{paddingTop: '1.5px', marginLeft: '-1px', marginRight: '3px'}} />;
    }
    if (connect.deepSeek) {
      return <img src={deepSeekLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.gemini) {
      return <img src={geminiLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.groq) {
      return (
        <img
          src={groqLogo}
          width="17"
          style={{paddingTop: '5.5px', marginRight: '6px'}}
          className="adaptive-logo-filter"
        />
      );
    }
    if (connect.huggingFace) {
      return <img src={huggingFaceLogo} width="24" style={{paddingTop: '2.5px', marginRight: '6px'}} />;
    }
    if (connect.kimi) {
      return (
        <img
          src={kimiLogo}
          width="17"
          style={{paddingTop: '5.5px', marginRight: '6px'}}
          className="adaptive-logo-filter"
        />
      );
    }
    if (connect.miniMax) {
      return <img src={minimaxLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.mistral) {
      return <img src={mistralLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.ollama) {
      return (
        <img
          src={ollamaLogo}
          width="17"
          style={{paddingTop: '5.5px', marginRight: '6px'}}
          className="adaptive-logo-filter"
        />
      );
    }
    if (connect.openRouter) {
      return (
        <img
          src={openRouterLogo}
          width="17"
          style={{paddingTop: '5.5px', marginRight: '6px'}}
          className="adaptive-logo-filter"
        />
      );
    }
    if (connect.perplexity) {
      return (
        <img
          src={perplexityLogo}
          width="17"
          style={{paddingTop: '5.5px', marginRight: '6px'}}
          className="adaptive-logo-filter"
        />
      );
    }
    if (connect.qwen) {
      return <img src={qwenLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.stabilityAI) {
      return <img src={stabilityAILogo} width="19" style={{paddingTop: '4.8px', marginRight: '6px'}} />;
    }
    if (connect.together) {
      return <img src={togetherLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
    }
    if (connect.x) {
      return (
        <img src={xLogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} className="adaptive-logo-filter" />
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
