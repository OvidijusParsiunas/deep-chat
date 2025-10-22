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
// speech-to-text, stream

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
    const type = newActiveType || availableTypes[0];
    setActiveType(type);
    if (newService === 'custom' || newService === 'webModel') {
      setRequiredValue(chatComponent.connect[newService]?.url || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService]);
    } else {
      setRequiredValue(chatComponent.connect[newService]?.key || '');
      resetRequiredValue2(newService, type);
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService][type]);
    }
    setTimeout(() => {
      changeCode(newService, type);
      // 5 as otherwise when connect is custom and opening modal causes extractOptionalParameterValues to throw error
    }, 5);
  };

  const changeType = (newType) => {
    const type = changeFirstLetter(newType, false);
    setActiveType(type);
    setOptionalParameters(
      activeService === 'custom' || activeService === 'webModel'
        ? SERVICE_MODAL_FORM_CONFIG[activeService]
        : SERVICE_MODAL_FORM_CONFIG[activeService][type]
    );
    resetRequiredValue2(activeService, type);
    setTimeout(() => changeCode(activeService, type));
  };

  const resetRequiredValue2 = (service, type) => {
    const requiredParameter = REQUIRED_PARAMETERS[service]?.[type];
    if (requiredParameter) {
      setRequiredValue2(chatComponent.connect[service]?.[type]?.[requiredParameter] || '');
    }
  };

  const changeRequiredValue = (setRequiredValue, newKey) => {
    setRequiredValue(newKey);
    setTimeout(() => changeCode(activeService, activeType));
  };

  const changeCode = (serviceArg, newTypeArg) => {
    const service = serviceArg || activeService;
    const type = newTypeArg || activeType;
    // timeout for optional parameters to be populated up in time
    // test by creating OpenAI Assistant, set load_thread_history to true, submit, then open modal again to see if code section is correct
    setTimeout(() => {
      const connect = constructConnect(optionalParamsRef.current, service, type);
      if (service === 'custom') {
        const websocketValue = connect['custom'].websocket === 'true';
        setWebsocket(websocketValue);
        if (websocketValue) {
          setTimeout(() => {
            const newConnect = constructConnect(optionalParamsRef.current, service, type);
            setCode(getCodeStr(newConnect, true, view));
          });
          return;
        }
        return setCode(getCodeStr(connect, true, view));
      }
      setCode(getCodeStr(connect, false, view, type));
    });
  };

  function constructConnect(optionalParamsEl, activeService, activeType) {
    if (activeService === 'demo') return {demo: true};
    const optionalParamsValues = optionalParamsEl ? extractOptionalParameterValues(optionalParamsEl) : [];
    const optionalParams =
      activeService === 'custom' || activeService === 'webModel'
        ? SERVICE_MODAL_FORM_CONFIG[activeService]
        : SERVICE_MODAL_FORM_CONFIG[activeService][activeType];
    const connect = buildConnect(optionalParams, optionalParamsValues);
    const requiredParameter = REQUIRED_PARAMETERS[activeService]?.[activeType];
    if (requiredParameter) {
      const requiredSecondValue = requiredValue2Ref.current?.value;
      connect[requiredParameter] = requiredSecondValue;
    }
    if (activeService === 'webModel') return {webModel: connect};
    return {
      [activeService]:
        activeService === 'custom'
          ? {url: requiredValueRef.current?.value || '', ...connect}
          : {key: requiredValueRef.current?.value || '', [activeType]: Object.keys(connect).length > 0 ? connect : true},
    };
  }

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
        id="playground-service-modal"
        ref={modalRef}
        className={`playground-modal ${isVisible ? 'playground-modal-fade-in' : 'playground-modal-fade-out'}`}
      >
        <b className="playground-modal-title">Service Settings</b>
        <div className="playgroud-service-modal-form">
          <Service activeService={activeService} changeService={changeService} modalRef={modalRef} />
          {activeService !== 'demo' && activeService !== 'custom' && activeService !== 'webModel' && (
            <ServiceType
              availableTypes={availableTypes}
              activeService={activeService}
              activeType={activeType}
              changeType={changeType}
              pseudoNames={PSEUDO_NAMES}
              modalRef={modalRef}
            />
          )}
          {activeService !== 'demo' && activeService !== 'custom' && activeService !== 'webModel' && (
            <Required
              ref={requiredValueRef}
              requiredValue={requiredValue}
              setValue={changeRequiredValue.bind(this, setRequiredValue)}
              title="API Key:"
              view={view}
              changeCode={changeCode}
              link={SERVICE_TYPE_TO_API_KEY_LINK[activeService]}
            />
          )}
          {activeService === 'custom' && (
            <Required
              ref={requiredValueRef}
              requiredValue={requiredValue}
              setValue={changeRequiredValue.bind(this, setRequiredValue)}
              title="URL:"
              link={'https://deepchat.dev/docs/connect#connect-1'}
            />
          )}
          {REQUIRED_PARAMETERS[activeService]?.[activeType] && (
            <Required
              ref={requiredValue2Ref}
              requiredValue={requiredValue2}
              setValue={changeRequiredValue.bind(this, setRequiredValue2)}
              title={`${changeFirstLetter(REQUIRED_PARAMETERS[activeService][activeType])}:`}
              link={REQUIRED_PARAMETERS_LINKS[activeService][activeType]}
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
                activeService === 'custom' || activeService === 'webModel'
                  ? chatComponent.connect[activeService]
                  : chatComponent.connect[activeService]?.[activeType]
              }
              changeCode={changeCode}
              websocket={websocket}
              pseudoNames={PSEUDO_NAMES}
              links={
                activeService === 'custom' || activeService === 'webModel'
                  ? OPTIONAL_PARAM_TO_LINK[activeService]
                  : OPTIONAL_PARAM_TO_LINK[activeService]?.[activeType]
              }
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
          constructConnect={() => constructConnect(optionalParamsRef.current, activeService, activeType)}
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

function extractFiles(connect) {
  const substringIndexStart = 'allow'.length;
  return Object.keys(connect)
    .filter((key) => !!key.toLowerCase().startsWith('allow'))
    .reduce((currValue, key) => {
      const fileType = changeFirstLetter(key.substring(substringIndexStart), false);
      const attribute = ` ${fileType}="${connect[key]}"\n`;
      delete connect[key];
      return currValue + attribute;
    }, '\n');
}

function getCodeStr(connect, isCustom, view, type) {
  if (connect.demo) {
    return `<deep-chat demo="true"></deep-chat>`;
  }
  if (connect.webModel) {
    return `<deep-chat ${
      Object.keys(connect.webModel).length > 0
        ? `webModel='${JSON.stringify(connect.webModel, null, 2)}'`
        : `webModel="true"`
    }></deep-chat>`;
  }
  let files = '';
  if (isCustom) {
    const extractedFiles = extractFiles(connect['custom']);
    if (extractedFiles.length > 1) files = extractedFiles;
    return `<deep-chat${files} connect='${JSON.stringify(connect['custom'], null, 2)}'></deep-chat>`;
  }
  const service = Object.keys(connect)[0];
  if (!view.isKeyVisible) {
    connect = JSON.parse(JSON.stringify(connect));
    if (connect[service].key) connect[service].key = 'hidden';
  }
  if (typeof connect[service][type] === 'object') {
    const extractedFiles = extractFiles(connect[service][type]);
    if (extractedFiles.length > 1) files = extractedFiles;
    if (Object.keys(connect[service][type]).length === 0) connect[service][type] = true;
  }
  return `<deep-chat${files} directConnection='${JSON.stringify(connect, null, 2)}'></deep-chat>`;
}

function extractOptionalParameterValues(optionalParamsEl) {
  return Array.from(optionalParamsEl.children).map((element) => {
    const valueEl = element.children[1];
    const attemptedParseNumber = parseNumber(valueEl.value);
    if (attemptedParseNumber !== null) return attemptedParseNumber;
    if (valueEl.classList.contains('playground-select')) {
      const selectedValue = valueEl.children[2].children[0].children[0].children[0].children[0].innerText.trim();
      if (selectedValue === 'true') return true;
      if (selectedValue === 'false') return false;
      return selectedValue.length > 0 ? selectedValue : undefined;
    }
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
    return valueEl.value;
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

// not including api keys
const REQUIRED_PARAMETERS = {
  azure: {
    textToSpeech: 'region',
    speechToText: 'region',
    summarization: 'endpoint',
  },
  huggingFace: {
    questionAnswer: 'context',
  },
};

const REQUIRED_PARAMETERS_LINKS = {
  azure: {
    textToSpeech: 'https://deepchat.dev/docs/directConnection/Azure#TextToSpeech',
    speechToText: 'https://deepchat.dev/docs/directConnection/Azure#SpeechToText',
    summarization: 'https://deepchat.dev/docs/directConnection/Azure#Summarization',
  },
  huggingFace: {
    questionAnswer: 'https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task',
  },
};

// Service type names are uppercased in select
const PSEUDO_NAMES = {
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
  allowImages: 'Allow Images',
  allowGifs: 'Allow Gifs',
  allowCamera: 'Allow Camera',
  allowAudio: 'Allow Audio',
  allowMicrophone: 'Allow Microphone',
  allowMixedFiles: 'Allow Mixed Files',
};

// TO-DO - add default values
// TO-DO - string arrays end_sequences
const SERVICE_MODAL_FORM_CONFIG = {
  demo: {demo: {}},
  custom: {
    method: ['POST', 'PUT', 'GET'],
    websocket: ['true', 'false'],
    stream: ['true', 'false'],
    headers: 'constructable object',
    additionalBodyProps: 'constructable object',
    allowImages: ['true', 'false'],
    allowCamera: ['true', 'false'],
    allowGifs: ['true', 'false'],
    allowAudio: ['true', 'false'],
    allowMicrophone: ['true', 'false'],
    allowMixedFiles: ['true', 'false'],
  },
  webModel: {model: 'string', instruction: 'string'},
  assemblyAI: {
    audio: {},
  },
  azure: {
    textToSpeech: {
      lang: 'string',
      name: 'string',
      gender: 'string',
      outputFormat: 'string',
    },
    speechToText: {
      lang: 'string',
    },
    summarization: {
      language: 'string',
    },
    translation: {
      region: 'string',
      language: 'string',
    },
  },
  bigModel: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
      allowMixedFiles: ['true', 'false'],
    },
    images: {
      model: 'string',
    },
    textToSpeech: {
      model: 'string',
      voice: 'string',
    },
  },
  claude: {
    chat: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      top_k: 'number',
      stop_sequences: 'constructable object',
      system_prompt: 'string',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
  },
  cohere: {
    chat: {
      model: 'string',
      temperature: 'number',
      prompt_truncation: ['AUTO', 'OFF'],
    },
  },
  deepSeek: {
    chat: {
      model: 'string',
      temperature: 'number',
      max_tokens: 'number',
      top_p: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      stop: 'constructable object',
      system_prompt: 'string',
    },
  },
  gemini: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      maxOutputTokens: 'number',
      temperature: 'number',
      topP: 'number',
      topK: 'number',
      stopSequences: 'constructable object',
      responseMimeType: 'string',
      responseSchema: 'constructable object',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
  },
  groq: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_completion_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      stop: 'constructable object',
      seed: 'number',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
    textToSpeech: {
      model: 'string',
      voice: 'string',
      speed: 'number',
      response_format: ['mp3', 'opus', 'aac', 'flac'],
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
    },
    audioSpeechRecognition: {model: 'string'},
    audioClassification: {model: 'string'},
    imageClassification: {model: 'string'},
  },
  kimi: {
    chat: {
      model: 'string',
      temperature: 'number',
      max_tokens: 'number',
      top_p: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      stop: 'constructable object',
      system_prompt: 'string',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
  },
  miniMax: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      stop: 'constructable object',
    },
  },
  mistral: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      random_seed: 'number',
      n: 'number',
      safe_mode: ['true', 'false'],
      reasoning_mode: 'string',
      presence_penalty: 'number',
      frequency_penalty: 'number',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
  },
  ollama: {
    chat: {
      model: 'string',
      system: 'string',
      think: ['true', 'false'],
      keep_alive: ['true', 'false'],
      options: {
        temperature: 'number',
        top_k: 'number',
        top_p: 'number',
        min_p: 'number',
      },
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
  },
  openAI: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
    },
    assistant: {
      assistant_id: 'string',
      thread_id: 'string',
      load_thread_history: ['true', 'false'],
      custom_base_url: 'string',
      allowMixedFiles: ['true', 'false'],
    },
    realtime: {
      config: {
        model: 'string',
        instructions: 'string',
        voice: 'string',
        temperature: 'number',
      },
    },
    images: {
      model: 'string',
      n: 'number',
      size: 'string',
      user: 'string',
      quality: 'string',
      style: 'string,',
    },
    textToSpeech: {
      model: 'string',
      voice: 'string',
      speed: 'number',
    },
    speechToText: {
      model: 'string',
      temperature: 'number',
      language: 'string',
      type: ['transcription', 'translation'],
    },
  },
  openRouter: {
    chat: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      system_prompt: 'string',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
      allowAudio: ['true', 'false'],
    },
  },
  perplexity: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      top_k: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      stop: 'constructable object',
      search_mode: ['web', 'academic'],
      reasoning_effort: ['low', 'medium', 'high'],
      search_domain_filter: 'constructable object',
      disable_search: ['true', 'false'],
      enable_search_classifier: ['true', 'false'],
    },
  },
  qwen: {
    chat: {
      model: 'string',
      temperature: 'number',
      max_tokens: 'number',
      top_p: 'number',
      frequency_penalty: 'number',
      presence_penalty: 'number',
      stop: 'constructable object',
      system_prompt: 'string',
      allowImages: ['true', 'false'],
      allowCamera: ['true', 'false'],
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
  together: {
    chat: {
      model: 'string',
      system_prompt: 'string',
      max_tokens: 'number',
      temperature: 'number',
      top_p: 'number',
      top_k: 'number',
      repetition_penalty: 'number',
      stop: 'constructable object',
    },
    images: {
      model: 'string',
      width: 'number',
      height: 'number',
      steps: 'number',
      n: 'number',
      seed: 'number',
      response_format: ['url', 'base64'],
    },
    textToSpeech: {
      model: 'string',
      voice: 'string',
      speed: 'number',
    },
  },
  x: {
    chat: {
      model: 'string',
      max_tokens: 'number',
      temperature: 'number',
      system_prompt: 'string',
    },
    images: {
      model: 'string',
      n: 'number',
    },
  },
};

const SERVICE_TYPE_TO_API_KEY_LINK = {
  demo: '',
  custom: '',
  webModel: '',
  assemblyAI: 'https://www.assemblyai.com/app/account',
  azure:
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal',
  bigModel: 'https://open.bigmodel.cn/',
  claude: 'https://console.anthropic.com/',
  cohere: 'https://dashboard.cohere.ai/api-keys',
  deepSeek: 'https://platform.deepseek.com/',
  gemini: 'https://aistudio.google.com/app/apikey',
  groq: 'https://console.groq.com/keys',
  huggingFace: 'https://huggingface.co/settings/tokens',
  kimi: 'https://platform.moonshot.ai/',
  miniMax: 'https://www.minimax.io/',
  mistral: 'https://console.mistral.ai/',
  ollama: '',
  openAI: 'https://platform.openai.com/account/api-keys',
  openRouter: 'https://openrouter.ai/keys',
  perplexity: 'https://www.perplexity.ai/settings/api',
  qwen: 'https://www.alibabacloud.com/product/dashscope',
  stabilityAI: 'https://platform.stability.ai/docs/getting-started/authentication',
  together: 'https://api.together.xyz/settings/api-keys',
  x: 'https://x.ai/',
};

const OPTIONAL_PARAM_TO_LINK = {
  demo: {demo: ''},
  custom: {
    method: 'https://deepchat.dev/docs/connect#connect-1',
    websocket: 'https://deepchat.dev/docs/connect#Websocket',
    stream: 'https://deepchat.dev/docs/connect#Stream',
    headers: 'https://deepchat.dev/docs/connect#connect-1',
    additionalBodyProps: 'https://deepchat.dev/docs/connect#connect-1',
    allowImages: 'https://deepchat.dev/docs/files#images',
    allowCamera: 'https://deepchat.dev/docs/files#camera',
    allowGifs: 'https://deepchat.dev/docs/files#gifs',
    allowAudio: 'https://deepchat.dev/docs/files#audio',
    allowMicrophone: 'https://deepchat.dev/docs/files#microphone',
    allowMixedFiles: 'https://deepchat.dev/docs/files/#mixedFiles',
  },
  webModel: {
    model:
      'https://github.com/OvidijusParsiunas/deep-chat/blob/4449a91e26bb86d1d3a45633fd49c4dead3293d4/component/src/types/webModel/webModel.ts#L1',
    instruction: 'https://deepchat.dev/docs/webModel#webModel',
  },
  assemblyAI: {
    audio: '',
  },
  azure: {
    textToSpeech: {
      lang: 'https://learn.microsoft.com/en-GB/azure/ai-services/speech-service/language-support?tabs=tts',
      name: 'https://learn.microsoft.com/en-GB/azure/ai-services/speech-service/language-support?tabs=tts',
      gender: 'https://deepchat.dev/docs/directConnection/Azure#TextToSpeech',
      outputFormat:
        'https://learn.microsoft.com/en-GB/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming#audio-outputs',
    },
    speechToText: {
      lang: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt',
    },
    summarization: {
      language:
        'https://en.wikipedia.org/wiki/IETF_language_tag#:~:text=An%20IETF%20BCP%2047%20language,the%20IANA%20Language%20Subtag%20Registry.',
    },
    translation: {
      region: 'https://deepchat.dev/docs/directConnection/Azure#Translation',
      language:
        'https://en.wikipedia.org/wiki/IETF_language_tag#:~:text=An%20IETF%20BCP%2047%20language,the%20IANA%20Language%20Subtag%20Registry.',
    },
    // currently not offering the Azure OpenAI option as the playground is not set up to handle multiple required parameters
  },
  bigModel: {
    chat: {
      model: 'https://docs.bigmodel.cn/docs/model-list',
      system_prompt: 'https://docs.bigmodel.cn/api-reference/模型-api/对话补全',
      max_tokens: 'https://docs.bigmodel.cn/api-reference/模型-api/对话补全',
      temperature: 'https://docs.bigmodel.cn/api-reference/模型-api/对话补全',
      top_p: 'https://docs.bigmodel.cn/api-reference/模型-api/对话补全',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
      allowMixedFiles: 'https://deepchat.dev/docs/files/#mixedFiles',
    },
    images: {
      model: 'https://docs.bigmodel.cn/api-reference/模型-api/图像生成',
    },
    textToSpeech: {
      model: 'https://docs.bigmodel.cn/api-reference/模型-api/文本转语音',
      voice: 'https://docs.bigmodel.cn/api-reference/模型-api/文本转语音',
    },
  },
  claude: {
    chat: {
      model: 'https://docs.anthropic.com/en/docs/about-claude/models',
      max_tokens: 'https://docs.anthropic.com/en/api/messages',
      temperature: 'https://docs.anthropic.com/en/api/messages',
      top_p: 'https://docs.anthropic.com/en/api/messages',
      top_k: 'https://docs.anthropic.com/en/api/messages',
      stop_sequences: 'https://docs.anthropic.com/en/api/messages',
      system_prompt: 'https://docs.anthropic.com/en/api/messages',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
  },
  cohere: {
    chat: {
      model: 'https://docs.cohere.com/reference/chat',
      temperature: 'https://docs.cohere.com/reference/chat',
      prompt_truncation: 'https://docs.cohere.com/reference/chat',
    },
  },
  deepSeek: {
    chat: {
      model: 'https://api-docs.deepseek.com/api/create-chat-completion',
      temperature: 'https://api-docs.deepseek.com/api/create-chat-completion',
      max_tokens: 'https://api-docs.deepseek.com/api/create-chat-completion',
      top_p: 'https://api-docs.deepseek.com/api/create-chat-completion',
      frequency_penalty: 'https://api-docs.deepseek.com/api/create-chat-completion',
      presence_penalty: 'https://api-docs.deepseek.com/api/create-chat-completion',
      stop: 'https://api-docs.deepseek.com/api/create-chat-completion',
      system_prompt: 'https://api-docs.deepseek.com/api/create-chat-completion',
    },
  },
  gemini: {
    chat: {
      model: 'https://ai.google.dev/models/gemini',
      system_prompt: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      maxOutputTokens: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      temperature: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      topP: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      topK: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      stopSequences: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      responseMimeType: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      responseSchema: 'https://ai.google.dev/api/rest/v1beta/models/generateContent',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
  },
  groq: {
    chat: {
      model: 'https://console.groq.com/docs/models',
      system_prompt: 'https://console.groq.com/docs/api-reference#chat-create',
      max_completion_tokens: 'https://console.groq.com/docs/api-reference#chat-create',
      temperature: 'https://console.groq.com/docs/api-reference#chat-create',
      top_p: 'https://console.groq.com/docs/api-reference#chat-create',
      stop: 'https://console.groq.com/docs/api-reference#chat-create',
      seed: 'https://console.groq.com/docs/api-reference#chat-create',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
    textToSpeech: {
      model: 'https://console.groq.com/docs/api-reference#audio-speechCalled',
      voice: 'https://console.groq.com/docs/api-reference#audio-speechCalled',
      speed: 'https://console.groq.com/docs/api-reference#audio-speechCalled',
      response_format: 'https://console.groq.com/docs/api-reference#audio-speechCalled',
    },
  },
  huggingFace: {
    conversation: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
      parameters: {
        min_length: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
        max_length: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
        top_k: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
        top_p: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
        temperature: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
        repetition_penalty: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
      },
      options: {
        use_cache: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
      },
    },
    textGeneration: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
      parameters: {
        top_k: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
        top_p: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
        temperature: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
        repetition_penalty: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
        max_new_tokens: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
        do_sample: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
      },
      options: {
        use_cache: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
      },
    },
    summarization: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
      parameters: {
        min_length: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
        max_length: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
        top_k: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
        top_p: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
        temperature: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
        repetition_penalty: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
      },
      options: {
        use_cache: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
      },
    },
    translation: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#translation-task',
      options: {
        use_cache: 'https://huggingface.co/docs/api-inference/detailed_parameters#translation-task',
      },
    },
    fillMask: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#fill-mask-task',
      options: {
        use_cache: 'https://huggingface.co/docs/api-inference/detailed_parameters#fill-mask-task',
      },
    },
    questionAnswer: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task',
    },
    audioSpeechRecognition: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#automatic-speech-recognition-task',
    },
    audioClassification: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#audio-classification-task',
    },
    imageClassification: {
      model: 'https://huggingface.co/docs/api-inference/detailed_parameters#image-classification-task',
    },
  },
  kimi: {
    chat: {
      model: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      temperature: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      max_tokens: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      top_p: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      frequency_penalty: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      presence_penalty: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      stop: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      system_prompt: 'https://platform.moonshot.ai/docs/api/chat#chat-completion',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
  },
  miniMax: {
    chat: {
      model: 'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#model',
      system_prompt:
        'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
      max_tokens:
        'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
      temperature:
        'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
      top_p:
        'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
      frequency_penalty:
        'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
      presence_penalty:
        'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
      stop: 'https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek',
    },
  },
  mistral: {
    chat: {
      model: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      system_prompt: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      max_tokens: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      temperature: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      top_p: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      random_seed: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      n: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      safe_mode: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      reasoning_mode: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      presence_penalty: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      frequency_penalty: 'https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
  },
  ollama: {
    chat: {
      model: 'https://ollama.com/library',
      system: 'https://ollama.com/',
      think: 'https://ollama.com/',
      keep_alive: 'https://ollama.com/',
      options: {
        temperature: 'https://ollama.com/',
        top_k: 'https://ollama.com/',
        top_p: 'https://ollama.com/',
        min_p: 'https://ollama.com/',
      },
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
  },
  openAI: {
    chat: {
      system_prompt: 'https://deepchat.dev/docs/directConnection/OpenAI#Chat',
      model: 'https://platform.openai.com/docs/api-reference/chat/object#chat/object-model',
      max_tokens: 'https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_tokens',
      temperature: 'https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature',
      top_p: 'https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
    assistant: {
      assistant_id: 'https://deepchat.dev/docs/directConnection/OpenAI#Assistant',
      thread_id: 'https://deepchat.dev/docs/directConnection/OpenAI#Assistant',
      load_thread_history: 'https://deepchat.dev/docs/directConnection/OpenAI#Assistant',
      custom_base_url: 'https://deepchat.dev/docs/directConnection/OpenAI#Assistant',
      allowMixedFiles: 'https://deepchat.dev/docs/files/#mixedFiles',
    },
    realtime: {
      config: {
        model: 'https://deepchat.dev/docs/directConnection/OpenAIRealtime#OpenAIRealtimeConfig',
        instructions: 'https://deepchat.dev/docs/directConnection/OpenAIRealtime#OpenAIRealtimeConfig',
        voice: 'https://deepchat.dev/docs/directConnection/OpenAIRealtime#OpenAIRealtimeConfig',
        temperature: 'https://deepchat.dev/docs/directConnection/OpenAIRealtime#OpenAIRealtimeConfig',
      },
    },
    images: {
      model: 'https://platform.openai.com/docs/api-reference/images/create#images-create-model',
      n: 'https://deepchat.dev/docs/directConnection/OpenAI#dall-e-2',
      size: 'https://platform.openai.com/docs/api-reference/images/create#images-create-size',
      user: 'https://platform.openai.com/docs/api-reference/images/create#images-create-user',
      quality: 'https://deepchat.dev/docs/directConnection/OpenAI#dall-e-3',
      style: 'https://deepchat.dev/docs/directConnection/OpenAI#dall-e-3,',
    },
    textToSpeech: {
      model: 'https://platform.openai.com/docs/api-reference/audio/createSpeech#audio-createspeech-model',
      voice: 'https://platform.openai.com/docs/api-reference/audio/createSpeech#audio-createspeech-voice',
      speed: 'https://platform.openai.com/docs/api-reference/audio/createSpeech#audio-createspeech-speed',
    },
    speechToText: {
      model: 'https://platform.openai.com/docs/api-reference/audio/createTranscription#audio-createtranscription-model',
      temperature:
        'https://platform.openai.com/docs/api-reference/audio/createTranscription#audio-createtranscription-temperature',
      language:
        'https://platform.openai.com/docs/api-reference/audio/createTranscription#audio-createtranscription-language',
      type: 'https://platform.openai.com/docs/api-reference/audio',
    },
  },
  openRouter: {
    chat: {
      model: 'https://openrouter.ai/docs/api-reference/chat-completion',
      max_tokens: 'https://openrouter.ai/docs/api-reference/chat-completion',
      temperature: 'https://openrouter.ai/docs/api-reference/chat-completion',
      top_p: 'https://openrouter.ai/docs/api-reference/chat-completion',
      frequency_penalty: 'https://openrouter.ai/docs/api-reference/chat-completion',
      presence_penalty: 'https://openrouter.ai/docs/api-reference/chat-completion',
      system_prompt: 'https://openrouter.ai/docs/api-reference/chat-completion',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
      allowAudio: 'https://deepchat.dev/docs/files#audio',
    },
  },
  perplexity: {
    chat: {
      model: 'https://docs.perplexity.ai/api-reference/chat-completions-posts',
      system_prompt: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      max_tokens: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      temperature: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      top_p: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      top_k: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      frequency_penalty: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      presence_penalty: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      stop: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      search_mode: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      reasoning_effort: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      search_domain_filter: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      disable_search: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
      enable_search_classifier: 'https://docs.perplexity.ai/api-reference/chat-completions-post',
    },
  },
  qwen: {
    chat: {
      model: 'https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api',
      temperature: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      max_tokens: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      top_p: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      frequency_penalty: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      presence_penalty: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      stop: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      system_prompt: 'https://www.alibabacloud.com/help/en/model-studio/developer-reference/qwen-api-details',
      allowImages: 'https://deepchat.dev/docs/files#images',
      allowCamera: 'https://deepchat.dev/docs/files#camera',
    },
  },
  stabilityAI: {
    textToImage: {
      height: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      width: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      engine_id: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      weight: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      cfg_scale: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      clip_guidance_preset: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      samples: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      seed: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      steps: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      style_preset: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
      sampler: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
    },
    imageToImage: {
      init_image_mode: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      image_strength: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      step_schedule_start: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      step_schedule_end: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      engine_id: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      weight: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      cfg_scale: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      clip_guidance_preset: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      samples: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      seed: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      steps: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      style_preset: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
      sampler: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
    },
    imageToImageMasking: {
      mask_source: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      engine_id: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      weight: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      cfg_scale: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      clip_guidance_preset: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      samples: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      seed: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      steps: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      style_preset: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
      sampler: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
    },
    imageToImageUpscale: {
      engine_id: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage',
      height: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage',
      width: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage',
    },
  },
  together: {
    chat: {
      model: 'https://docs.together.ai/docs/inference-models',
      system_prompt: 'https://docs.together.ai/reference/chat-completions-1',
      max_tokens: 'https://docs.together.ai/reference/chat-completions-1',
      temperature: 'https://docs.together.ai/reference/chat-completions-1',
      top_p: 'https://docs.together.ai/reference/chat-completions-1',
      top_k: 'https://docs.together.ai/reference/chat-completions-1',
      repetition_penalty: 'https://docs.together.ai/reference/chat-completions-1',
      stop: 'https://docs.together.ai/reference/chat-completions-1',
    },
    images: {
      model: 'https://docs.together.ai/docs/inference-models#image-models',
      width: 'https://docs.together.ai/reference/post-images-generations',
      height: 'https://docs.together.ai/reference/post-images-generations',
      steps: 'https://docs.together.ai/reference/post-images-generations',
      n: 'https://docs.together.ai/reference/post-images-generations',
      seed: 'https://docs.together.ai/reference/post-images-generations',
      response_format: 'https://docs.together.ai/reference/post-images-generations',
    },
    textToSpeech: {
      model: 'https://docs.together.ai/reference/audio-speech',
      voice: 'https://docs.together.ai/reference/audio-speech',
      speed: 'https://docs.together.ai/reference/audio-speech',
    },
  },
  x: {
    chat: {
      model: 'https://docs.x.ai/docs/api-reference#chat-completions',
      max_tokens: 'https://docs.x.ai/docs/api-reference#chat-completions',
      temperature: 'https://docs.x.ai/docs/api-reference#chat-completions',
      system_prompt: 'https://docs.x.ai/docs/api-reference#chat-completions',
    },
    images: {
      model: 'https://docs.x.ai/docs/api-reference#image-generations',
      n: 'https://docs.x.ai/docs/api-reference#image-generations',
    },
  },
};
