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
    const type = newActiveType || availableTypes[0];
    setActiveType(type);
    if (newService === 'custom') {
      setRequiredValue(chatComponent.connect[newService]?.url || '');
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService]);
    } else {
      setRequiredValue(chatComponent.connect[newService]?.key || '');
      resetRequiredValue2(newService, type);
      setOptionalParameters(SERVICE_MODAL_FORM_CONFIG[newService][type]);
    }
    setTimeout(() => {
      changeCode(newService, type);
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
    const connect = constructConnect(optionalParamsRef.current, service, type);
    if (service === 'custom') {
      setWebsocket(connect['custom'].websocket);
      if (connect['custom'].websocket) {
        setTimeout(() => {
          const newConnect = constructConnect(optionalParamsRef.current, service, type);
          setCode(getCodeStr(newConnect, true, view));
        });
        return;
      }
      return setCode(getCodeStr(connect, true, view));
    }
    setCode(getCodeStr(connect, false, view));
  };

  function constructConnect(optionalParamsEl, activeService, activeType) {
    if (activeService === 'demo') return {demo: true};
    const optionalParamsValues = optionalParamsEl ? extractOptionalParameterValues(optionalParamsEl) : [];
    const optionalParams =
      activeService === 'custom'
        ? SERVICE_MODAL_FORM_CONFIG[activeService]
        : SERVICE_MODAL_FORM_CONFIG[activeService][activeType];
    const connect = buildConnect(optionalParams, optionalParamsValues);
    const requiredParameter = REQUIRED_PARAMETERS[activeService]?.[activeType];
    if (requiredParameter) {
      const requiredSecondValue = requiredValue2Ref.current?.value;
      connect[requiredParameter] = requiredSecondValue;
    }
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
          {activeService !== 'demo' && activeService !== 'custom' && (
            <ServiceType
              availableTypes={availableTypes}
              activeService={activeService}
              activeType={activeType}
              changeType={changeType}
              pseudoNames={PSEUDO_NAMES}
              modalRef={modalRef}
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
              link={SERVICE_TYPE_TO_API_KEY_LINK[activeService]}
            />
          )}
          {activeService === 'custom' && (
            <Required
              ref={requiredValueRef}
              requiredValue={requiredValue}
              setValue={changeRequiredValue.bind(this, setRequiredValue)}
              title="URL:"
              link={'https://deepchat.dev/docs/connect#Request'}
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
                activeService === 'custom'
                  ? chatComponent.connect[activeService]
                  : chatComponent.connect[activeService]?.[activeType]
              }
              changeCode={changeCode}
              websocket={websocket}
              pseudoNames={PSEUDO_NAMES}
              links={
                activeService === 'custom'
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
  systemPrompt: 'System_prompt',
};

// TO-DO - add default values
// TO-DO - string arrays end_sequences
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
      systemPrompt: 'string',
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
    },
    audioSpeechRecognition: {model: 'string'},
    audioClassification: {model: 'string'},
    imageClassification: {model: 'string'},
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

const SERVICE_TYPE_TO_API_KEY_LINK = {
  demo: '',
  custom: '',
  openAI: 'https://platform.openai.com/account/api-keys',
  cohere: 'https://dashboard.cohere.ai/api-keys',
  huggingFace: 'https://huggingface.co/settings/tokens',
  azure:
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal',
  stabilityAI: 'https://platform.stability.ai/docs/getting-started/authentication',
  assemblyAI: 'https://www.assemblyai.com/app/account',
};

const OPTIONAL_PARAM_TO_LINK = {
  demo: {demo: ''},
  custom: {
    method: 'https://deepchat.dev/docs/connect#Request',
    websocket: 'https://deepchat.dev/docs/connect#Websocket',
    headers: 'https://deepchat.dev/docs/connect#Request',
    additionalBodyProps: 'https://deepchat.dev/docs/connect#Request',
  },
  openAI: {
    chat: {
      systemPrompt: 'https://deepchat.dev/docs/directConnection/OpenAI#Chat',
      model: 'https://platform.openai.com/docs/api-reference/chat/object#model',
      max_tokens: 'https://platform.openai.com/docs/api-reference/chat/create#max_tokens',
      temperature: 'https://platform.openai.com/docs/api-reference/chat/create#temperature',
      top_p: 'https://platform.openai.com/docs/api-reference/chat/create#top_p',
    },
    completions: {
      model: 'https://platform.openai.com/docs/api-reference/completions/object#model',
      max_tokens: 'https://platform.openai.com/docs/api-reference/completions/create#max_tokens',
      temperature: 'https://platform.openai.com/docs/api-reference/completions/create#temperature',
      top_p: 'https://platform.openai.com/docs/api-reference/completions/create#top_p',
    },
    images: {
      n: 'https://platform.openai.com/docs/api-reference/images/create#n',
      size: 'https://platform.openai.com/docs/api-reference/images/create#size',
      user: 'https://platform.openai.com/docs/api-reference/images/create#user',
    },
    audio: {
      model: 'https://platform.openai.com/docs/api-reference/audio/createTranscription#model',
      temperature: 'https://platform.openai.com/docs/api-reference/audio/createTranscription#temperature',
      language: 'https://platform.openai.com/docs/api-reference/audio/createTranscription#language',
      type: 'https://platform.openai.com/docs/api-reference/audio',
    },
  },
  cohere: {
    chat: {
      model: 'https://docs.cohere.com/docs/conversational-ai#parameters',
      user_name: 'https://docs.cohere.com/docs/conversational-ai#parameters',
      temperature: 'https://docs.cohere.com/docs/conversational-ai#parameters',
      max_tokens: 'https://docs.cohere.com/docs/conversational-ai#parameters',
    },
    textGeneration: {
      model: 'https://docs.cohere.com/reference/generate',
      temperature: 'https://docs.cohere.com/reference/generate',
      max_tokens: 'https://docs.cohere.com/reference/generate',
      k: 'https://docs.cohere.com/reference/generate',
      p: 'https://docs.cohere.com/reference/generate',
      frequency_penalty: 'https://docs.cohere.com/reference/generate',
      presence_penalty: 'https://docs.cohere.com/reference/generate',
      truncate: 'https://docs.cohere.com/reference/generate',
      logit_bias: 'https://docs.cohere.com/reference/generate',
    },
    summarization: {
      model: 'https://docs.cohere.com/reference/summarize-2',
      length: 'https://docs.cohere.com/reference/summarize-2',
      format: 'https://docs.cohere.com/reference/summarize-2',
      extractiveness: 'https://docs.cohere.com/reference/summarize-2',
      temperature: 'https://docs.cohere.com/reference/summarize-2',
      additional_command: 'https://docs.cohere.com/reference/summarize-2',
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
  assemblyAI: {
    audio: '',
  },
};
