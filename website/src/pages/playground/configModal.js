import './configModal.css';
import React from 'react';

const servicesProperties = {
  demo: {},
  custom: {
    method: ['POST', 'PUT', 'GET'],
    headers: 'customizable object',
    additionalBodyProps: 'customizable object',
    websocket: ['true', 'false'],
  },
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
        use_cache: ['true', 'false'],
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

function CustomizableObject({config, changeCode}) {
  const [properties, setProperties] = React.useState(
    Object.keys(config || []).map((property) => ({
      keyName: property,
      value: config[property],
    }))
  );
  return (
    <div style={{display: 'flow-root'}} className={'customizable-object'}>
      {properties.map((property, index) => (
        <div key={index}>
          <div style={{float: 'left', marginRight: '5px', color: '#5e5e5e', fontSize: '15px'}}>
            <input type="string" defaultValue={property.keyName} onChange={() => changeCode()}></input>:
          </div>
          <input type="string" defaultValue={property.value} onChange={() => changeCode()}></input>
          <button
            onClick={() => {
              properties.splice(index, 1);
              setProperties([...properties]);
              setTimeout(() => {
                changeCode();
              });
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        style={{width: 48}}
        onClick={() => {
          setProperties([...properties, {keyName: '', value: ''}]);
          changeCode();
        }}
      >
        Add
      </button>
    </div>
  );
}

function Parameter({parametersObject, config, changeCode}) {
  if (Array.isArray(parametersObject)) {
    return (
      <select defaultValue={config ?? ''} onChange={() => changeCode()}>
        <option value={''} key={-1}></option>
        {parametersObject.map((type, index) => {
          return (
            <option value={type} key={index}>
              {type}
            </option>
          );
        })}
      </select>
    );
  }
  if (parametersObject === 'customizable object') {
    return <CustomizableObject config={config} changeCode={changeCode} />;
  }
  return <input onChange={() => changeCode()} defaultValue={config ?? ''} type={parametersObject}></input>;
}

function ParameterField({name, parametersObject, config, changeCode}) {
  return (
    <div>
      <div
        style={{
          float: parametersObject !== 'customizable object' ? 'left' : '',
          marginRight: '5px',
          color: '#5e5e5e',
          fontSize: '15px',
        }}
      >
        {pseudoNames[name] || capitalizeFirstLetter(name)}:{' '}
      </div>
      <Parameter parametersObject={parametersObject} config={config} changeCode={changeCode}></Parameter>
    </div>
  );
}

const AdditionalProperties = React.forwardRef(({optionalParameters, config, changeCode, websocket}, ref) => {
  return (
    <div ref={ref}>
      {Object.keys((!websocket && optionalParameters) || {})
        .filter((param) => param !== 'websocket')
        .map((param, index) => {
          return typeof optionalParameters[param] === 'object' && !Array.isArray(optionalParameters[param]) ? (
            Object.keys(optionalParameters[param]).map((type, index) => {
              return (
                <ParameterField
                  key={index}
                  name={type}
                  parametersObject={optionalParameters[param][type]}
                  config={config?.[param]?.[type]}
                  changeCode={changeCode}
                />
              );
            })
          ) : (
            <ParameterField
              key={index}
              name={param}
              parametersObject={optionalParameters[param]}
              config={config?.[param]}
              changeCode={changeCode}
            ></ParameterField>
          );
        })}
      {optionalParameters['websocket'] && (
        <ParameterField
          name={'websocket'}
          parametersObject={optionalParameters['websocket']}
          config={config?.[param]}
          changeCode={changeCode}
        ></ParameterField>
      )}
    </div>
  );
});

function parseNumber(inputString) {
  if (!isNaN(inputString)) {
    const parsedResult = parseFloat(inputString);
    if (!isNaN(parsedResult)) return parsedResult;
  }
  return null;
}

function constructNewConfig(otherParametersEl, serviceProperties, activeService, activeType, requiredProp) {
  const newConfig = {};
  const values = Array.from(otherParametersEl.children).map((element) => {
    const value = element.children[1].value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    const attemptedParseNumber = parseNumber(value);
    if (attemptedParseNumber !== null) return attemptedParseNumber;
    if (value === undefined && element.children[1].classList.contains('customizable-object')) {
      const object = Array.from(element.children[1].children || []).reduce((currentObject, propertyElement) => {
        if (propertyElement?.tagName === 'DIV') {
          const keyName = propertyElement.children[0].children[0].value;
          const value = propertyElement.children[1].value;
          if (keyName.trim().length > 0 || value.trim().length > 0) {
            currentObject[propertyElement.children[0].children[0].value] = propertyElement.children[1].value;
          }
        }
        return currentObject;
      }, {});
      if (Object.keys(object).length > 0) return object;
    }
    return value;
  });
  let index = 0;
  const properties =
    activeService === 'custom' ? serviceProperties[activeService] : serviceProperties[activeService][activeType];
  Object.keys(properties).forEach((parameter) => {
    const value = properties[parameter];
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach((parameter1) => {
        if (values[index] !== '') {
          newConfig[parameter] ??= {};
          newConfig[parameter][parameter1.toLocaleLowerCase()] = values[index];
        }
        index += 1;
      });
    } else {
      if (values[index] !== undefined && values[index] !== '') {
        newConfig[parameter.toLocaleLowerCase()] = values[index];
      }
      index += 1;
    }
  });
  return {
    [activeService]:
      activeService === 'custom'
        ? {url: requiredProp, ...newConfig}
        : {key: requiredProp, [activeType]: Object.keys(newConfig).length > 0 ? newConfig : true},
  };
}

function updateExistingConfigWithNew(existingConfig, newConfig) {
  Object.keys(existingConfig).forEach((key) => {
    delete existingConfig[key];
  });
  Object.assign(existingConfig, newConfig);
}

const pseudoNames = {textGeneration: 'Text Generation'};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function ConfigModal({activeConfig, setModalDisplayed, component}) {
  const [activeService, setActiveService] = React.useState('Service');
  const [types, setTypes] = React.useState([]);
  const [required, setRequired] = React.useState('');
  const [activeType, setActiveType] = React.useState('Service');
  const [optionalParameters, setOptionalParameters] = React.useState({});
  const keyRef = React.useRef(null);
  const otherParametersRef = React.useRef(null);
  const [code, setCode] = React.useState('');
  const [websocket, setWebsocket] = React.useState(false); // have to keep it in this state as it must not affect config

  React.useEffect(() => {
    const service = Object.keys(activeConfig || 'demo')[0];
    changeService(service);
  }, []);

  const changeService = (newService) => {
    setActiveService(newService);
    const types = Object.keys(servicesProperties[newService]);
    setTypes(types);
    setActiveType(types[0]);
    if (newService === 'custom') {
      setRequired(activeConfig[newService]?.url || '');
      setOptionalParameters(servicesProperties[newService]);
    } else {
      setRequired(activeConfig[newService]?.key || '');
      setOptionalParameters(servicesProperties[newService][types[0]]);
    }
    setTimeout(() => changeCode(newService, types[0]));
  };

  const changeType = (newType) => {
    setActiveType(newType);
    setOptionalParameters(
      activeService === 'custom' ? servicesProperties[newService] : servicesProperties[activeService][newType]
    );
    setTimeout(() => changeCode(activeService, newType));
  };

  const changeKey = (newKey) => {
    setRequired(newKey);
    setTimeout(() => changeCode(activeService, activeType));
  };

  const changeCode = (service, newType) => {
    const currentService = service || activeService;
    const currentType = newType || activeType;
    const newConfig = constructNewConfig(
      otherParametersRef.current,
      servicesProperties,
      currentService,
      currentType,
      keyRef.current.value
    );
    if (currentService === 'custom') {
      setWebsocket(newConfig['custom'].websocket);
      if (newConfig['custom'].websocket) {
        setTimeout(() => {
          const newConfig = constructNewConfig(
            otherParametersRef.current,
            servicesProperties,
            currentService,
            currentType,
            keyRef.current.value
          );
          setCode(`<deep-chat request='${JSON.stringify(newConfig['custom'], null, 2)}'></deep-chat>`);
        });
      } else {
        setCode(`<deep-chat request='${JSON.stringify(newConfig['custom'], null, 2)}'></deep-chat>`);
      }
    } else {
      setCode(`<deep-chat directConnection='${JSON.stringify(newConfig, null, 2)}'></deep-chat>`);
    }
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
      <div style={{width: '100%', display: activeService !== 'demo' && activeService !== 'custom' ? 'block' : 'none'}}>
        <div style={{float: 'left', marginRight: '5px'}}>Type:</div>
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
      <div style={{width: '100%', display: activeService !== 'demo' && activeService !== 'custom' ? 'block' : 'none'}}>
        <div style={{float: 'left', marginRight: '5px'}}>API Key:</div>
        <input ref={keyRef} value={required} onChange={(event) => changeKey(event.target.value)}></input>
      </div>
      <div style={{width: '100%', display: activeService === 'custom' ? 'block' : 'none'}}>
        <div style={{float: 'left', marginRight: '5px'}}>URL:</div>
        <input ref={keyRef} value={required} onChange={(event) => changeKey(event.target.value)}></input>
      </div>
      <div style={{marginTop: '10px'}}>Additional parameters:</div>
      <AdditionalProperties
        ref={otherParametersRef}
        optionalParameters={optionalParameters}
        config={activeService === 'custom' ? activeConfig[activeService] : activeConfig[activeService]?.[activeType]}
        changeCode={changeCode}
        websocket={websocket}
      />
      <div style={{marginTop: '10px'}}>Code:</div>
      <div>
        <pre>{code}</pre>
      </div>
      <div style={{textAlign: 'center'}}>
        <button
          onClick={() => {
            setModalDisplayed(false);
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            const newConfig = constructNewConfig(
              otherParametersRef.current,
              servicesProperties,
              activeService,
              activeType,
              keyRef.current.value
            );
            updateExistingConfigWithNew(activeConfig, newConfig);
            component.current.update();
            setModalDisplayed(false);
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
