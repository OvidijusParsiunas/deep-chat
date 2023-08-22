import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import PlaygroundSelect from '../../playgroundSelect';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import Flash from '/img/flash.svg';
import Cog from '/img/cog.svg';
import React from 'react';

// WORK - preload
export default function Service({activeService, changeService}) {
  return (
    <div>
      <div className="playground-service-modal-input-label">Service:</div>
      <PlaygroundSelect
        options={Object.keys(services).map((service) => services[service])}
        defaultOption={services[activeService]}
        onChange={changeService}
        isImages={true}
      />
    </div>
  );
}

const services = {
  demo: {
    value: 'demo',
    text: 'None',
    icon: <Cog width="14" style={{marginLeft: '0.5px', marginRight: '2.5px'}} />,
  },
  custom: {
    value: 'custom',
    text: 'Custom',
    icon: <Flash width="17" style={{marginLeft: '-2px', marginRight: '1px'}} />,
  },
  openAI: {
    value: 'openAI',
    text: 'OpenAI',
    icon: (
      <img
        src={openAILogo}
        width="13"
        style={{
          marginTop: '1px',
          marginLeft: '1px',
          marginRight: '2px',
          filter:
            'brightness(0) saturate(100%) invert(16%) sepia(0%) saturate(575%) hue-rotate(163deg) brightness(100%) contrast(93%)',
        }}
      />
    ),
  },
  huggingFace: {
    value: 'huggingFace',
    text: 'Hugging Face',
    icon: <img src={huggingFaceLogo} width="17" style={{marginLeft: '-2px', marginRight: '1px'}} />,
  },
  cohere: {
    value: 'cohere',
    text: 'Cohere',
    icon: <img src={cohereLogo} width="22" style={{marginTop: '1px', marginLeft: '-3px', marginRight: '-2px'}} />,
  },
  stabilityAI: {
    value: 'stabilityAI',
    text: 'StabilityAI',
    icon: <img src={stabilityAILogo} width="16" style={{marginLeft: '1px', marginRight: '0px'}} />,
  },
  azure: {
    value: 'azure',
    text: 'Azure',
    icon: <img src={azureLogo} width="15" style={{marginRight: '1px'}} />,
  },
  assemblyAI: {
    value: 'assemblyAI',
    text: 'AssemblyAI',
    icon: <img src={assemblyAILogo} width="13" style={{marginTop: '-1px', marginRight: '2px'}} />,
  },
};
