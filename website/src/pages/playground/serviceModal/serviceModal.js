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
// add a copy button when hovering over code
// TO-DO
// images, audio, gifs, camera, speech-to-text, stream

// editingChatRef is used for displaying modal
export default function ServiceModal({chatComponent, collapseStates, setEditingChatRef, view}) {
  const modalRef = React.useRef(null);
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
    const activeType = newActiveType || availableTypes[0];
    setActiveType(activeType);
    if (newService === 'custom') {
      setRequiredValue(chatComponent.connect[newService]?.url || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService]);
    } else {
      setRequiredValue(chatComponent.connect[newService]?.key || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService][activeType]);
    }
    setTimeout(() => {
      changeCode(newService, activeType);
      // 6 as otherwise when connect is custom and opening modal causes extractOptionalParameterValues to throw error
    }, 6);
  };

  const changeType = (newType) => {
    const type = changeFirstLetter(newType, false);
    setActiveType(type);
    setOptionalParameters(
      activeService === 'custom'
        ? SERVICE_MODAL_FORM_CONFIG[activeService]
        : SERVICE_MODAL_FORM_CONFIG[activeService][type]
    );
    setTimeout(() => changeCode(activeService, type));
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
          const newConnect = constructConnect(optionalParamsRef.current, service, type, requiredValueRef.current?.value);
          setCode(getCodeStr(newConnect, true, view));
        });
        return;
      }
      return setCode(getCodeStr(connect, true, view));
    }
    setCode(getCodeStr(connect, false, view));
  };

  const close = () => {
    setIsVisible(false);
    setTimeout(() => {
      setEditingChatRef(null);
    }, 200);
  };

  return (
    <div>
      <div
        className={`playground-service-modal-background ${
          isVisible ? 'playground-modal-fade-in-background' : 'playground-modal-fade-out-background'
        }`}
        onClick={close}
      ></div>
      <div
        ref={modalRef}
        className={`playground-modal ${isVisible ? 'playground-modal-fade-in' : 'playground-modal-fade-out'}`}
      >
        <b className="playground-modal-title">Service Settings</b>
        <div className="playgroud-service-modal-form">
          <Service activeService={activeService} changeService={changeService} modalRef={modalRef} />
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
              view={view}
              changeCode={changeCode}
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

function changeFirstLetter(text, capitalize = true) {
  return text.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + text.slice(1);
}

function getCodeStr(connect, isCustom, view) {
  if (isCustom) {
    return `<deep-chat request='${JSON.stringify(connect['custom'], null, 2)}'></deep-chat>`;
  }
  if (!view.isKeyVisible) {
    connect = JSON.parse(JSON.stringify(connect));
    const service = Object.keys(connect)[0];
    if (connect[service].key) connect[service].key = '';
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

// Service type names are uppercased in select
const pseudoNames = {
  TextGeneration: 'Text Generation',
  FillMask: 'Fill Mask',
  QuestionAnswer: 'Question Answer',
  AudioSpeechRecognition: 'Speech Recognition',
  AudioClassification: 'Audio Classification',
  ImageClassification: 'Image Classification',
  TextToSpeech: 'Text To Speech',
  SpeechToText: 'Speech To Text',
  TextToImage: 'Text To Image',
  ImageToImage: 'Image To Image',
  ImageToImageMasking: 'Image To Image Masking',
  ImageToImageUpscale: 'Image To Image Upscale',
};

const SERVICE_MODAL_FORM_CONFIG = {
  demo: {demo: {}},
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
    completions: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
    },
    images: {
      n: 'number',
      size: ['256x256', '512x512', '1024x1024'],
      user: 'string',
    },
    audio: {
      model: 'string',
      temperature: 'number',
      language: 'string',
      type: ['transcription', 'translation'],
    },
  },
  cohere: {
    chat: {
      model: 'string',
      user_name: 'number',
      temperature: 'number',
      max_tokens: 'number',
    },
    textGeneration: {
      model: ['command', 'base', 'base-light'],
      temperature: 'number',
      max_tokens: 'number',
      k: 'number',
      p: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      truncate: ['NONE', 'START', 'END'],
      logit_bias: 'constructable object',
    },
    summarization: {
      model: ['summarize-xlarge', 'summarize-medium'],
      length: ['auto', 'short', 'medium', 'long'],
      format: ['auto', 'paragraph', 'bullets'],
      extractiveness: ['auto', 'low', 'medium', 'high'],
      temperature: 'number',
      additional_command: 'string',
    },
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
    textGeneration: {
      model: 'string',
      parameters: {
        top_k: 'number',
        top_p: 'number',
        temperature: 'number',
        repetition_penalty: 'number',
        max_new_tokens: 'number',
        do_sample: ['true', 'false'],
      },
      options: {
        use_cache: ['true', 'false'],
      },
    },
    summarization: {
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
    translation: {
      model: 'string',
      options: {
        use_cache: ['true', 'false'],
      },
    },
    fillMask: {
      model: 'string',
      options: {
        use_cache: ['true', 'false'],
      },
    },
    questionAnswer: {
      model: 'string',
      context: 'string', // required
    },
    audioSpeechRecognition: {model: 'string'},
    audioClassification: {model: 'string'},
    imageClassification: {model: 'string'},
  },
  azure: {
    textToSpeech: {
      region: 'string', // required
      lang: 'string',
      name: 'string',
      gender: 'string',
      outputFormat: 'string',
    },
    speechToText: {
      region: 'string', // required
      lang: 'string',
    },
    summarization: {
      endpoint: 'string', // required
      language: 'string',
    },
    translation: {
      region: 'string',
      language: 'string',
    },
  },
  stabilityAI: {
    textToImage: {
      height: 'number',
      width: 'number',
      engine_id: 'string',
      weight: 'number',
      cfg_scale: 'number',
      clip_guidance_preset: ['FAST_BLUE', 'FAST_GREEN', 'NONE', 'SIMPLE', 'SLOW', 'SLOWER', 'SLOWEST'],
      samples: 'number',
      seed: 'number',
      steps: 'number',
      style_preset: 'string',
      sampler: 'string',
    },
    imageToImage: {
      init_image_mode: ['image_strength', 'step_schedule_*'],
      image_strength: 'number',
      step_schedule_start: 'number',
      step_schedule_end: 'number',
      engine_id: 'string',
      weight: 'number',
      cfg_scale: 'number',
      clip_guidance_preset: ['FAST_BLUE', 'FAST_GREEN', 'NONE', 'SIMPLE', 'SLOW', 'SLOWER', 'SLOWEST'],
      samples: 'number',
      seed: 'number',
      steps: 'number',
      style_preset: 'string',
      sampler: 'string',
    },
    imageToImageMasking: {
      mask_source: ['MASK_IMAGE_WHITE', 'MASK_IMAGE_BLACK', 'INIT_IMAGE_ALPHA'],
      engine_id: 'string',
      weight: 'number',
      cfg_scale: 'number',
      clip_guidance_preset: ['FAST_BLUE', 'FAST_GREEN', 'NONE', 'SIMPLE', 'SLOW', 'SLOWER', 'SLOWEST'],
      samples: 'number',
      seed: 'number',
      steps: 'number',
      style_preset: 'string',
      sampler: 'string',
    },
    imageToImageUpscale: {
      engine_id: 'string',
      height: 'number',
      width: 'number',
    },
  },
  assemblyAI: {
    audio: {},
  },
};
