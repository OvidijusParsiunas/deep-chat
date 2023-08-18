import './configModal.css';
import React from 'react';

const servicesProperties = {
  demo: {},
  openAI: {
    chat: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
    },
    completions: {},
    images: {},
    audio: {},
  },
  cohere: {
    chat: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
    },
    textGeneration: {},
    summarization: {},
    audio: {},
  },
  huggingFace: {
    conversation: {
      model: 'string',
      parameters: {
        min_length: 'number',
        max_length: 'number',
        top_k: 'number',
        top_p: 'number',
        temperature: 'number',
        repetition_penalty: 'number',
      },
      options: {
        use_cache: 'boolean',
      },
    },
    // textGeneration: true | (HuggingFaceModel & HuggingFaceTextGenerationConfig);
    // summarization: true | (HuggingFaceModel & HuggingFaceSummarizationConfig);
    // translation: true | (HuggingFaceModel & HuggingFaceTranslationConfig);
    // fillMask: true | (HuggingFaceModel & HuggingFaceFillMaskConfig);
    // questionAnswer: HuggingFaceModel & HuggingFaceQuestionAnswerConfig;
    // audioSpeechRecognition: true | HuggingFaceModel;
    // audioClassification: true | HuggingFaceModel;
    // imageClassification: true | HuggingFaceModel;
  },
};

function constructNewConfig(otherParametersEl, serviceProperties) {
  const newConfig = {};
  const values = Array.from(otherParametersEl.children).map((element) => element.children[1].value);
  let index = 0;
  Object.keys(serviceProperties).forEach((parameter) => {
    const value = serviceProperties[parameter];
    if (typeof value === 'object') {
      Object.keys(value).forEach((parameter1) => {
        if (values[index] !== '') {
          newConfig[parameter] ??= {};
          newConfig[parameter][parameter1.toLocaleLowerCase()] = values[index];
        }
        index += 1;
      });
    } else {
      if (values[index] !== '') {
        newConfig[parameter.toLocaleLowerCase()] = values[index];
      }
      index += 1;
    }
  });
  return newConfig;
}

const pseudoNames = {textGeneration: 'Text Generation'};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function ConfigModal({setModalDisplayed, activeConfig, component}) {
  const [activeService, setActiveService] = React.useState('Service');
  const [types, setTypes] = React.useState([]);
  const [activeType, setActiveType] = React.useState('Service');
  const [optionalParameters, setOptionalParameters] = React.useState({});
  const otherParametersRef = React.useRef(null);

  React.useEffect(() => {
    const service = Object.keys(activeConfig || 'demo')[0];
    setActiveService(service);
  }, []);

  const changeService = (newService) => {
    setActiveService(newService);
    const types = Object.keys(servicesProperties[newService]);
    setTypes(types);
    setActiveType(types[0]);
    setOptionalParameters(servicesProperties[newService][types[0]]);
  };

  const changeType = (newType) => {
    setActiveType(newType);
    setOptionalParameters(servicesProperties[activeService][newType]);
  };

  return (
    <div id="playground-config-modal">
      <div style={{width: '100%', textAlign: 'center'}}>Settings</div>
      <div style={{width: '100%'}}>
        <div style={{float: 'left', marginRight: '5px'}}>Service:</div>
        <select value={activeService} onChange={(event) => changeService(event.target.value)}>
          <option value="demo">None</option>
          <option value="custom">Custom</option>
          <option value="openAI">OpenAI</option>
          <option value="huggingFace">Hugging Face</option>
          <option value="azure">Azure</option>
          <option value="cohere">Cohere</option>
          <option value="stabilityAI">StabilityAI</option>
          <option value="assemblyAI">AssemblyAI</option>
        </select>
      </div>
      <div style={{width: '100%'}}>
        <select value={activeType} onChange={(event) => changeType(event.target.value)}>
          {types?.map((type, index) => {
            return (
              <option value={type} key={index}>
                {pseudoNames[type] || capitalizeFirstLetter(type)}
              </option>
            );
          })}
        </select>
      </div>
      <div style={{width: '100%'}}>
        <div style={{float: 'left', marginRight: '5px'}}>API Key:</div>
        <input></input>
      </div>
      <div style={{marginTop: '10px'}}>Additional parameters:</div>
      <div ref={otherParametersRef}>
        {Object.keys(optionalParameters || {}).map((param, index) => {
          return typeof optionalParameters[param] === 'object' ? (
            Object.keys(optionalParameters[param]).map((type, index) => {
              return (
                <div key={index}>
                  <div style={{float: 'left', marginRight: '5px', color: '#5e5e5e', fontSize: '15px'}}>
                    {pseudoNames[type] || capitalizeFirstLetter(type)}:{' '}
                  </div>
                  <input
                    onChange={(event) => console.log(event.target.value)}
                    type={optionalParameters[param][type]}
                  ></input>
                </div>
              );
            })
          ) : (
            <div key={index}>
              <div style={{float: 'left', marginRight: '5px', color: '#5e5e5e', fontSize: '15px'}}>
                {pseudoNames[param] || capitalizeFirstLetter(param)}:{' '}
              </div>
              <input onChange={(event) => console.log(event.target.value)} type={optionalParameters[param]}></input>
            </div>
          );
        })}
      </div>
      <div style={{textAlign: 'center'}}>
        <button
          onClick={() => {
            const newConfig = constructNewConfig(
              otherParametersRef.current,
              servicesProperties[activeService][activeType]
            );
            console.log(newConfig);
            component.current.update();
            setModalDisplayed(false);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
