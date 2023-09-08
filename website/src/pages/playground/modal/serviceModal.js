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

// editingChatRef is used for displaying modal
export default function ServiceModal({chatComponent, collapseStates, setEditingChatRef}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeService, setActiveService] = React.useState('Service');
  const [availableTypes, setAvailableTypes] = React.useState([]);
  const [activeType, setActiveType] = React.useState('');
  const [requiredValue, setRequiredValue] = React.useState(''); // this can either be an apiKey or a URL
  const requiredValueRef = React.useRef(null);
  const [requiredValue2, setRequiredValue2] = React.useState('');
  const requiredValue2Ref = React.useRef(null);
  const [optionalParameters, setOptionalParameters] = React.useState({});
  const optionalParamsRef = React.useRef(null);
  const [code, setCode] = React.useState('');
  const [websocket, setWebsocket] = React.useState(false); // have to keep it in this state as it must not affect connect object
  const submitButtonRef = React.useRef(null); // using ref in order to keep submit logic inside another component

  React.useEffect(() => {
    const initialService = Object.keys(chatComponent.connect || {demo: true})[0];
    const initialServiceObj = chatComponent.connect?.[initialService];
    const initialType =
      initialService && typeof initialServiceObj === 'object'
        ? Object.keys(SERVICE_MODAL_FORM_CONFIG[initialService]).find((key) => initialServiceObj[key])
        : undefined;
    changeService(initialService, initialType);
    setIsVisible(true);
    window.addEventListener('keydown', closeOnKeyPress);
    return () => {
      window.removeEventListener('keydown', closeOnKeyPress);
    };
  }, []);

  // closeOnKeyPress listener removed here as close() does not have the same context
  const closeOnKeyPress = (event) => {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'Enter') {
      submitButtonRef.current.click();
    }
  };

  const changeService = (newService, newActiveType) => {
    setActiveService(newService);
    const availableTypes = Object.keys(SERVICE_MODAL_FORM_CONFIG[newService]);
    setAvailableTypes(availableTypes);
    setActiveType(newActiveType || availableTypes[0]);
    if (newService === 'custom') {
      setRequiredValue(chatComponent.connect[newService]?.url || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService]);
    } else {
      setRequiredValue(chatComponent.connect[newService]?.key || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService][availableTypes[0]]);
    }
    setTimeout(() => {
      changeCode(newService, availableTypes[0]);
      // 6 as otherwise when connect is custom and opening modal causes extractOptionalParameterValues to throw error
    }, 6);
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

  const changeRequiredValue = (setRequiredValue, newKey) => {
    setRequiredValue(newKey);
    setTimeout(() => changeCode(activeService, activeType));
  };

  const changeCode = (serviceArg, newTypeArg) => {
    const service = serviceArg || activeService;
    const type = newTypeArg || activeType;
    const connect = constructConnect(optionalParamsRef.current, service, type, requiredValueRef.current?.value);
    if (service === 'custom') {
      setWebsocket(connect['custom'].websocket);
      if (connect['custom'].websocket) {
        setTimeout(() => {
          const newConfig = constructConnect(optionalParamsRef.current, service, type, requiredValueRef.current?.value);
          setCode(getCodeStr(newConfig, true));
        });
        return;
      }
      return setCode(getCodeStr(connect, true));
    }
    setCode(getCodeStr(connect, false));
  };

  const close = () => {
    setIsVisible(false);
    setTimeout(() => {
      setEditingChatRef(null);
    }, 200);
  };

  return (
    <div>
      {/* WORK - check if dirty before closing */}
      <div
        id="playground-service-modal-background"
        className={isVisible ? 'playground-modal-fade-in-background' : 'playground-modal-fade-out-background'}
        onClick={close}
      ></div>
      <div id="playground-service-modal" className={isVisible ? 'playground-modal-fade-in' : 'playground-modal-fade-out'}>
        <b id="playground-service-modal-title">Service Settings</b>
        <div className="playgroud-service-modal-form">
          <Service activeService={activeService} changeService={changeService} />
          {activeService !== 'demo' && activeService !== 'custom' && (
            <ServiceType
              availableTypes={availableTypes}
              activeService={activeService}
              activeType={activeType}
              changeType={changeType}
              pseudoNames={pseudoNames}
            />
          )}
          {activeService !== 'demo' && activeService !== 'custom' && (
            <Required
              ref={requiredValueRef}
              requiredValue={requiredValue}
              setValue={changeRequiredValue.bind(this, setRequiredValue)}
              title="API Key:"
            />
          )}
          {activeService === 'custom' && (
            <Required
              ref={requiredValueRef}
              requiredValue={requiredValue}
              setValue={changeRequiredValue.bind(this, setRequiredValue)}
              title="URL:"
            />
          )}
          {activeService === 'azure' && (activeType === 'textToSpeech' || activeType === 'speechToText') && (
            <Required
              ref={requiredValue2Ref}
              requiredValue={requiredValue2}
              setValue={changeRequiredValue.bind(this, setRequiredValue2)}
              title="Region:"
            />
          )}
        </div>
        {Object.keys(optionalParameters).length > 0 && (
          <CollapsableSection
            title={'Optional parameters'}
            collapseStates={collapseStates}
            prop={'optionalParams'}
            initExpanded={typeof chatComponent.connect[activeService]?.[activeType] === 'object'}
          >
            <OptionalParameters
              ref={optionalParamsRef}
              optionalParameters={optionalParameters}
              connect={
                activeService === 'custom'
                  ? chatComponent.connect[activeService]
                  : chatComponent.connect[activeService]?.[activeType]
              }
              changeCode={changeCode}
              websocket={websocket}
              pseudoNames={pseudoNames}
            />
          </CollapsableSection>
        )}
        {code && (
          <CollapsableSection title={'Code'} collapseStates={collapseStates} prop={'code'}>
            <Code code={code} />
          </CollapsableSection>
        )}
        <CloseButtons
          chatComponent={chatComponent}
          requiredFields={[requiredValueRef, requiredValue2Ref]}
          constructConnect={() =>
            constructConnect(optionalParamsRef.current, activeService, activeType, requiredValueRef.current?.value)
          }
          close={close}
          ref={submitButtonRef}
        />
      </div>
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

function getCodeStr(connect, isCustom) {
  if (isCustom) {
    return `<deep-chat request='${JSON.stringify(connect['custom'], null, 2)}'></deep-chat>`;
  }
  return `<deep-chat directConnection='${JSON.stringify(connect, null, 2)}'></deep-chat>`;
}

function constructConnect(optionalParamsEl, activeService, activeType, requiredProp) {
  if (activeService === 'demo') return {demo: true};
  const optionalParamsValues = optionalParamsEl ? extractOptionalParameterValues(optionalParamsEl) : [];
  const optionalParams =
    activeService === 'custom'
      ? SERVICE_MODAL_FORM_CONFIG[activeService]
      : SERVICE_MODAL_FORM_CONFIG[activeService][activeType];
  const connect = buildConnect(optionalParams, optionalParamsValues);
  return {
    [activeService]:
      activeService === 'custom'
        ? {url: requiredProp, ...connect}
        : {key: requiredProp, [activeType]: Object.keys(connect).length > 0 ? connect : true},
  };
}

// prettier-ignore
function extractOptionalParameterValues(optionalParamsEl) {
  return Array.from(optionalParamsEl.children).map((element) => {
    const valueEl = element.children[1];
    let value = valueEl.value;
    if (valueEl.classList.contains('playground-select')) {
      const selectValue = valueEl.children[2].children[0].children[0].children[0].children[0].textContent.trim();
      // connect methods (POST/GET/PUT) or strings with second letter as upper case don't need to be lower cased
      value = selectValue.length > 1 && selectValue.charAt(1) === selectValue.charAt(1).toUpperCase() ? selectValue : selectValue.toLowerCase();
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    const attemptedParseNumber = parseNumber(value);
    if (attemptedParseNumber !== null) return attemptedParseNumber;
    if (valueEl.classList.contains('playgroud-service-modal-form')) {
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

function buildConnect(optionalParams, optionalParamsValues) {
  const connect = {};
  let index = 0;
  Object.keys(optionalParams).forEach((parameter) => {
    const value = optionalParams[parameter];
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach((parameter1) => {
        if (optionalParamsValues[index] !== '') {
          connect[parameter] ??= {};
          connect[parameter][changeFirstLetter(parameter1, false)] = optionalParamsValues[index];
        }
        index += 1;
      });
    } else {
      if (optionalParamsValues[index] !== undefined && optionalParamsValues[index] !== '') {
        connect[changeFirstLetter(parameter, false)] = optionalParamsValues[index];
      }
      index += 1;
    }
  });
  return connect;
}

const SERVICE_MODAL_FORM_CONFIG = {
  demo: {demo: {}}, // inserting demo key as a placeholder
  custom: {
    method: ['POST', 'PUT', 'GET'],
    websocket: ['true', 'false'],
    headers: 'constructable object',
    additionalBodyProps: 'constructable object',
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
  azure: {
    textToSpeech: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
    },
    speechToText: {},
    summarization: {},
    translation: {},
  },
};
