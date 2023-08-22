import OptionalParameters from './fields/serviceOptionalParametersFields';
import CollapsableSection from './wrappers/collapsableSection';
import CloseButtons from './close/serviceModalCloseButtons';
import Required from './fields/serviceRequiredField';
import ServiceType from './fields/serviceTypeField';
import Service from './fields/serviceField';
import Code from './code/serviceCode';
import './serviceModal.css';
import React from 'react';

// TO-DO
// images, audio, gifs, camera, speech-to-text, stream
export default function ServiceModal({config, setModalDisplayed, chatComponent, collapseStates}) {
  const [activeService, setActiveService] = React.useState('Service');
  const [availableTypes, setAvailableTypes] = React.useState([]);
  const [activeType, setActiveType] = React.useState('');
  const [requiredValue, setRequiredValue] = React.useState(''); // this can either be an apiKey or a URL
  const requiredValueRef = React.useRef(null);
  const [optionalParameters, setOptionalParameters] = React.useState({});
  const optionalParamsRef = React.useRef(null);
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
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService]);
    } else {
      setRequiredValue(config[newService]?.key || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService][availableTypes[0]]);
    }
    setTimeout(() => {
      changeCode(newService, availableTypes[0]);
    });
  };

  const changeType = (newType) => {
    setActiveType(newType);
    setOptionalParameters(
      activeService === 'custom'
        ? SERVICE_MODAL_FORM_CONFIG[activeService]
        : SERVICE_MODAL_FORM_CONFIG[activeService][newType]
    );
    setTimeout(() => changeCode(activeService, newType));
  };

  const changeRequiredValue = (newKey) => {
    setRequiredValue(newKey);
    setTimeout(() => changeCode(activeService, activeType));
  };

  const changeCode = (serviceArg, newTypeArg) => {
    const service = serviceArg || activeService;
    const type = newTypeArg || activeType;
    const config = constructConfig(optionalParamsRef.current, service, type, requiredValueRef.current.value);
    if (service === 'custom') {
      setWebsocket(config['custom'].websocket);
      if (config['custom'].websocket) {
        setTimeout(() => {
          const newConfig = constructConfig(optionalParamsRef.current, service, type, requiredValueRef.current.value);
          setCode(getCodeStr(newConfig, true));
        });
        return;
      }
      return setCode(getCodeStr(config, true));
    }
    setCode(getCodeStr(config, false));
  };

  return (
    <div id="playground-service-modal">
      <div id="playground-service-modal-title">Service Settings</div>
      <div id="playgroud-service-modal-required-fields">
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
          <Required ref={requiredValueRef} requiredValue={requiredValue} setValue={changeRequiredValue} title="API Key:" />
        )}
        {activeService === 'custom' && (
          <Required ref={requiredValueRef} requiredValue={requiredValue} setValue={changeRequiredValue} title="URL:" />
        )}
      </div>
      <CollapsableSection
        changeVar={optionalParameters}
        title={'Optional parameters'}
        collapseStates={collapseStates}
        prop={'optionalParams'}
        initExpanded={typeof config[activeService]?.[activeType] === 'object'}
      >
        <OptionalParameters
          ref={optionalParamsRef}
          optionalParameters={optionalParameters}
          config={activeService === 'custom' ? config[activeService] : config[activeService]?.[activeType]}
          changeCode={changeCode}
          websocket={websocket}
          pseudoNames={pseudoNames}
        />
      </CollapsableSection>
      <CollapsableSection changeVar={code} title={'Code'} collapseStates={collapseStates} prop={'code'}>
        <Code code={code} />
      </CollapsableSection>
      <CloseButtons
        setModalDisplayed={setModalDisplayed}
        chatComponent={chatComponent}
        config={config}
        constructConfig={() =>
          constructConfig(optionalParamsRef.current, activeService, activeType, requiredValueRef.current.value)
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

function changeFirstLetter(text, capitalize = true) {
  return text.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + text.slice(1);
}

function getCodeStr(config, isCustom) {
  if (isCustom) {
    return `<deep-chat request='${JSON.stringify(config['custom'], null, 2)}'></deep-chat>`;
  }
  return `<deep-chat directConnection='${JSON.stringify(config, null, 2)}'></deep-chat>`;
}

function constructConfig(optionalParamsEl, activeService, activeType, requiredProp) {
  const optionalParamsValues = extractOptionalParameterValues(optionalParamsEl);
  const optionalParams =
    activeService === 'custom'
      ? SERVICE_MODAL_FORM_CONFIG[activeService]
      : SERVICE_MODAL_FORM_CONFIG[activeService][activeType];
  const config = buildConfig(optionalParams, optionalParamsValues);
  return {
    [activeService]:
      activeService === 'custom'
        ? {url: requiredProp, ...config}
        : {key: requiredProp, [activeType]: Object.keys(config).length > 0 ? config : true},
  };
}

function extractOptionalParameterValues(optionalParamsEl) {
  return Array.from(optionalParamsEl.children).map((element) => {
    const valueEl = element.children[1];
    let value = valueEl.value;
    if (valueEl.classList.contains('playground-select')) {
      value = valueEl.children[2].children[0].children[0].children[0].children[0].textContent.trim().toLowerCase();
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    const attemptedParseNumber = parseNumber(value);
    if (attemptedParseNumber !== null) return attemptedParseNumber;
    if (valueEl.classList.contains('playground-constructable-object')) {
      const object = Array.from(valueEl.children || []).reduce((currentObject, propertyElement) => {
        if (propertyElement?.tagName === 'DIV') {
          const keyName = propertyElement.children[0].value;
          const value = propertyElement.children[1].value;
          if (keyName.trim().length > 0 || value.trim().length > 0) currentObject[keyName] = value;
        }
        return currentObject;
      }, {});
      if (Object.keys(object).length > 0) return object;
    }
    return value;
  });
}

function buildConfig(optionalParams, optionalParamsValues) {
  const config = {};
  let index = 0;
  Object.keys(optionalParams).forEach((parameter) => {
    const value = optionalParams[parameter];
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach((parameter1) => {
        if (optionalParamsValues[index] !== '') {
          config[parameter] ??= {};
          config[parameter][changeFirstLetter(parameter1, false)] = optionalParamsValues[index];
        }
        index += 1;
      });
    } else {
      if (optionalParamsValues[index] !== undefined && optionalParamsValues[index] !== '') {
        config[changeFirstLetter(parameter, false)] = optionalParamsValues[index];
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
