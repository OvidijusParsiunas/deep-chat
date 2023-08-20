import AdditionalParameters from './fields/serviceAdditionalParametersFields';
import CloseButtons from './close/serviceModalCloseButtons';
import Required from './fields/serviceRequiredField';
import ServiceType from './fields/serviceTypeField';
import Service from './fields/serviceField';
import Code from './code/serviceCode';
import './serviceModal.css';
import React from 'react';

// TO-DO
// images, audio, gifs, camera, speech-to-text, stream
export default function ServiceModal({config, setModalDisplayed, chatComponent}) {
  const [activeService, setActiveService] = React.useState('Service');
  const [availableTypes, setAvailableTypes] = React.useState([]);
  const [activeType, setActiveType] = React.useState('');
  const [requiredValue, setRequiredValue] = React.useState(''); // this can either be an apiKey or a URL
  const requiredValueRef = React.useRef(null);
  const [additionalParameters, setAdditionalParameters] = React.useState({});
  const additionalParamsRef = React.useRef(null);
  const [code, setCode] = React.useState('');
  const [websocket, setWebsocket] = React.useState(false); // have to keep it in this state as it must not affect config

  React.useEffect(() => {
    const service = Object.keys(config || {demo: true})[0];
    changeService(service);
  }, []);

  const changeService = (newService) => {
    setActiveService(newService);
    const availableTypes = Object.keys(SERVICE_MODAL_FORM_CONFIG[newService]);
    setAvailableTypes(availableTypes);
    setActiveType(availableTypes[0]);
    if (newService === 'custom') {
      setRequiredValue(config[newService]?.url || '');
      setAdditionalParameters(SERVICE_MODAL_FORM_CONFIG[newService]);
    } else {
      setRequiredValue(config[newService]?.key || '');
      setAdditionalParameters(SERVICE_MODAL_FORM_CONFIG[newService][availableTypes[0]]);
    }
    setTimeout(() => changeCode(newService, availableTypes[0]));
  };

  const changeType = (newType) => {
    setActiveType(newType);
    setAdditionalParameters(
      activeService === 'custom'
        ? SERVICE_MODAL_FORM_CONFIG[newService]
        : SERVICE_MODAL_FORM_CONFIG[activeService][newType]
    );
    setTimeout(() => changeCode(activeService, newType));
  };

  const changeKey = (newKey) => {
    setRequiredValue(newKey);
    setTimeout(() => changeCode(activeService, activeType));
  };

  const changeCode = (serviceArg, newTypeArg) => {
    const service = serviceArg || activeService;
    const type = newTypeArg || activeType;
    const config = constructConfig(additionalParamsRef.current, service, type, requiredValueRef.current.value);
    if (service === 'custom') {
      setWebsocket(config['custom'].websocket);
      if (config['custom'].websocket) {
        setTimeout(() => {
          const newConfig = constructConfig(additionalParamsRef.current, service, type, requiredValueRef.current.value);
          setCode(getCodeStr(newConfig, true));
        });
        return;
      }
      return setCode(getCodeStr(config, true));
    }
    setCode(getCodeStr(config, false));
  };

  return (
    <div id="playground-config-modal">
      <div style={{width: '100%', textAlign: 'center'}}>Service Settings</div>
      <Service activeService={activeService} changeService={changeService} />
      {activeService !== 'demo' && activeService !== 'custom' && (
        <ServiceType
          availableTypes={availableTypes}
          activeType={activeType}
          changeType={changeType}
          pseudoNames={pseudoNames}
        />
      )}
      {activeService !== 'demo' && activeService !== 'custom' && (
        <Required ref={requiredValueRef} requiredValue={requiredValue} changeKey={changeKey} title="API Key:" />
      )}
      {activeService === 'custom' && (
        <Required ref={requiredValueRef} requiredValue={requiredValue} changeKey={changeKey} title="URL:" />
      )}
      <div style={{marginTop: '10px'}}>Additional parameters:</div>
      <AdditionalParameters
        ref={additionalParamsRef}
        additionalParameters={additionalParameters}
        config={activeService === 'custom' ? config[activeService] : config[activeService]?.[activeType]}
        changeCode={changeCode}
        websocket={websocket}
        pseudoNames={pseudoNames}
      />
      <div style={{marginTop: '10px'}}>Code:</div>
      <Code code={code} />
      <CloseButtons
        setModalDisplayed={setModalDisplayed}
        chatComponent={chatComponent}
        config={config}
        constructConfig={() =>
          constructConfig(additionalParamsRef.current, activeService, activeType, requiredValueRef.current.value)
        }
      />
    </div>
  );
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Utility here as docusaurus SSR does not permit .js files that are not components

function parseNumber(inputString) {
  if (!isNaN(inputString)) {
    const parsedResult = parseFloat(inputString);
    if (!isNaN(parsedResult)) return parsedResult;
  }
  return null;
}

const pseudoNames = {textGeneration: 'Text Generation'};

function changeFirstLetter(string, capitalize = true) {
  return string.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + string.slice(1);
}

function getCodeStr(config, isCustom) {
  if (isCustom) {
    return `<deep-chat request='${JSON.stringify(config['custom'], null, 2)}'></deep-chat>`;
  }
  return `<deep-chat directConnection='${JSON.stringify(config, null, 2)}'></deep-chat>`;
}

function constructConfig(additionalParamsEl, activeService, activeType, requiredProp) {
  const additionParamsValues = extractAdditionalParameterValues(additionalParamsEl);
  const additionalParams =
    activeService === 'custom'
      ? SERVICE_MODAL_FORM_CONFIG[activeService]
      : SERVICE_MODAL_FORM_CONFIG[activeService][activeType];
  const config = buildConfig(additionalParams, additionParamsValues);
  return {
    [activeService]:
      activeService === 'custom'
        ? {url: requiredProp, ...config}
        : {key: requiredProp, [activeType]: Object.keys(config).length > 0 ? config : true},
  };
}

function extractAdditionalParameterValues(additionalParamsEl) {
  return Array.from(additionalParamsEl.children).map((element) => {
    const value = element.children[1].value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    const attemptedParseNumber = parseNumber(value);
    if (attemptedParseNumber !== null) return attemptedParseNumber;
    if (element.children[1].classList.contains('constructable-object')) {
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
}

function buildConfig(additionalParams, additionParamsValues) {
  const config = {};
  let index = 0;
  Object.keys(additionalParams).forEach((parameter) => {
    const value = additionalParams[parameter];
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach((parameter1) => {
        if (additionParamsValues[index] !== '') {
          config[parameter] ??= {};
          config[parameter][changeFirstLetter(parameter1, false)] = additionParamsValues[index];
        }
        index += 1;
      });
    } else {
      if (additionParamsValues[index] !== undefined && additionParamsValues[index] !== '') {
        config[changeFirstLetter(parameter, false)] = additionParamsValues[index];
      }
      index += 1;
    }
  });
  return config;
}

const SERVICE_MODAL_FORM_CONFIG = {
  demo: {},
  custom: {
    method: ['POST', 'PUT', 'GET'],
    headers: 'constructable object',
    additionalBodyProps: 'constructable object',
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
