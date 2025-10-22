import huggingFaceSmallLogo from '/img/huggingFaceSmallLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import PlaygroundSelect from '../../playgroundSelect';
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
import xLogo from '/img/xLogo.webp';
import Flash from '/img/flash.svg';
import './serviceField.css';
import React from 'react';

export default function Service({activeService, changeService, modalRef}) {
  return (
    <div>
      <a
        href={SERVICE_TO_LINK[activeService]}
        target="_blank"
        id="playground-service-modal-service-label"
        className="playground-service-modal-input-label"
      >
        Service:
      </a>
      <div>
        <PlaygroundSelect
          options={Object.keys(services).map((service) => services[service])}
          defaultOption={services[activeService]}
          onChange={changeService}
          isImages={true}
          modalRef={modalRef}
        />
      </div>
    </div>
  );
}

// icon svgs dimenstions must all be the same as otherwise the select element and the label's dimensions also change
// hence icons sizes are controlled via scale
const services = {
  demo: {
    value: 'demo',
    text: 'None',
    icon: (
      <Flash
        className="playground-service-modal-service-icon"
        width="19"
        style={{
          marginLeft: '1px',
          transform: 'scale(1.6)',
          filter:
            'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(926%) hue-rotate(322deg) brightness(97%) contrast(91%)',
        }}
      />
    ),
  },
  custom: {
    value: 'custom',
    text: 'Custom',
    icon: <Flash className="playground-service-modal-service-icon" style={{marginLeft: '1px', transform: 'scale(1.7)'}} />,
  },
  webModel: {
    value: 'webModel',
    text: 'Web Model',
    icon: (
      <WebModelLogo
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginLeft: '1.5px', transform: 'scale(1.52)'}}
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
  azure: {
    value: 'azure',
    text: 'Azure',
    icon: (
      <img
        src={azureLogo}
        className="playground-service-modal-service-icon"
        style={{transform: 'scale(1.05)', width: '14px', marginLeft: '-0.2px'}} // need to set width here manually as for some reason this image causes select to move down
      />
    ),
  },
  bigModel: {
    value: 'bigModel',
    text: 'BigModel',
    icon: (
      <img
        src={bigModelLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  claude: {
    value: 'claude',
    text: 'Claude',
    icon: (
      <img
        src={claudeLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  cohere: {
    value: 'cohere',
    text: 'Cohere',
    icon: <img src={cohereLogo} className="playground-service-modal-service-icon" style={{transform: 'scale(2.1)'}} />,
  },
  deepSeek: {
    value: 'deepSeek',
    text: 'DeepSeek',
    icon: (
      <img
        src={deepSeekLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  gemini: {
    value: 'gemini',
    text: 'Gemini',
    icon: (
      <img
        src={geminiLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  groq: {
    value: 'groq',
    text: 'Groq',
    icon: (
      <img
        src={groqLogo}
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  huggingFace: {
    value: 'huggingFace',
    text: 'Hugging Face',
    icon: (
      <img
        src={huggingFaceSmallLogo}
        className="playground-service-modal-service-icon"
        style={{transform: 'scale(1.4)', paddingTop: '0.2px'}}
      />
    ),
  },
  kimi: {
    value: 'kimi',
    text: 'Kimi',
    icon: (
      <img
        src={kimiLogo}
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  miniMax: {
    value: 'miniMax',
    text: 'MiniMax',
    icon: (
      <img
        src={minimaxLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  mistral: {
    value: 'mistral',
    text: 'Mistral',
    icon: (
      <img
        src={mistralLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  ollama: {
    value: 'ollama',
    text: 'Ollama',
    icon: (
      <img
        src={ollamaLogo}
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  openAI: {
    value: 'openAI',
    text: 'OpenAI',
    icon: (
      <img
        src={openAILogo}
        className="playground-service-modal-service-icon adaptive-openai-filter"
        style={{transform: 'scale(1.4)'}}
      />
    ),
  },
  openRouter: {
    value: 'openRouter',
    text: 'OpenRouter',
    icon: (
      <img
        src={openRouterLogo}
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  perplexity: {
    value: 'perplexity',
    text: 'Perplexity',
    icon: (
      <img
        src={perplexityLogo}
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  qwen: {
    value: 'qwen',
    text: 'Qwen',
    icon: (
      <img
        src={qwenLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  stabilityAI: {
    value: 'stabilityAI',
    text: 'StabilityAI',
    icon: (
      <img
        src={stabilityAILogo}
        className="playground-service-modal-service-icon"
        style={{marginLeft: '3px', transform: 'scale(1.6)', marginTop: '1px'}}
      />
    ),
  },
  together: {
    value: 'together',
    text: 'Together',
    icon: (
      <img
        src={togetherLogo}
        className="playground-service-modal-service-icon"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
  x: {
    value: 'x',
    text: 'X',
    icon: (
      <img
        src={xLogo}
        className="playground-service-modal-service-icon adaptive-logo-filter"
        style={{marginTop: '-1px', transform: 'scale(1.3)'}}
      />
    ),
  },
};

const SERVICE_TO_LINK = {
  demo: 'https://deepchat.dev/docs/modes#demo',
  custom: 'https://deepchat.dev/docs/connect',
  webModel: 'https://deepchat.dev/docs/webModel',
  assemblyAI: 'https://www.assemblyai.com/',
  azure: 'https://learn.microsoft.com/en-gb/azure/ai-services',
  bigModel: 'https://open.bigmodel.cn/',
  claude: 'https://console.anthropic.com/',
  cohere: 'https://docs.cohere.com/docs',
  deepSeek: 'https://www.deepseek.com/',
  gemini: 'https://ai.google.dev/',
  groq: 'https://groq.com/',
  huggingFace: 'https://huggingface.co/docs/api-inference/index',
  kimi: 'https://platform.moonshot.ai/',
  miniMax: 'https://www.minimax.io/',
  mistral: 'https://mistral.ai/',
  ollama: 'https://ollama.com/',
  openAI: 'https://openai.com/blog/openai-api',
  openRouter: 'https://openrouter.ai/',
  perplexity: 'https://www.perplexity.ai/',
  qwen: 'https://www.alibabacloud.com/product/dashscope',
  stabilityAI: 'https://stability.ai/',
  together: 'https://www.together.ai/',
  x: 'https://x.ai/',
};
