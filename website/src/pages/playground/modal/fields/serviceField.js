import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import PlaygroundSelect from '../../playgroundSelect';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import Flash from '/img/flash.svg';
import Cog from '/img/cog.svg';
import './serviceField.css';
import React from 'react';

// WORK - preload
export default function Service({activeService, changeService}) {
  return (
    <div>
      <div id="playground-service-modal-service-label" className="playground-service-modal-input-label">
        Service:
      </div>
      <PlaygroundSelect
        options={Object.keys(services).map((service) => services[service])}
        defaultOption={services[activeService]}
        onChange={changeService}
        isImages={true}
      />
    </div>
  );
}

// icon svgs dimenstions must all be the same as otherwise the select element and the label's dimensions also change
// hence icons sizes are controlled via scale
const services = {
  demo: {
    value: 'demo',
    text: 'None',
    icon: <Cog className="playground-service-modal-service-icon" style={{transform: 'scale(1.5)'}} />,
  },
  custom: {
    value: 'custom',
    text: 'Custom',
    icon: <Flash className="playground-service-modal-service-icon" style={{marginLeft: '1px', transform: 'scale(1.7)'}} />,
  },
  openAI: {
    value: 'openAI',
    text: 'OpenAI',
    icon: (
      <img
        src={openAILogo}
        className="playground-service-modal-service-icon"
        style={{
          transform: 'scale(1.4)',
          filter:
            'brightness(0) saturate(100%) invert(16%) sepia(0%) saturate(575%) hue-rotate(163deg) brightness(100%) contrast(93%)',
        }}
      />
    ),
  },
  huggingFace: {
    value: 'huggingFace',
    text: 'Hugging Face',
    icon: (
      <img src={huggingFaceLogo} className="playground-service-modal-service-icon" style={{transform: 'scale(1.7)'}} />
    ),
  },
  cohere: {
    value: 'cohere',
    text: 'Cohere',
    icon: <img src={cohereLogo} className="playground-service-modal-service-icon" style={{transform: 'scale(2.1)'}} />,
  },
  stabilityAI: {
    value: 'stabilityAI',
    text: 'StabilityAI',
    icon: (
      <img
        src={stabilityAILogo}
        className="playground-service-modal-service-icon"
        style={{marginLeft: '3px', transform: 'scale(1.6)'}}
      />
    ),
  },
  azure: {
    value: 'azure',
    text: 'Azure',
    icon: (
      <img
        src={azureLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-2px', transform: 'scale(1.6)'}}
      />
    ),
  },
  assemblyAI: {
    value: 'assemblyAI',
    text: 'AssemblyAI',
    icon: (
      <img
        src={assemblyAILogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
};
