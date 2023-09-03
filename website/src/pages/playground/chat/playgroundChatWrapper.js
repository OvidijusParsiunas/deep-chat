import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import './playgroundChatWrapper.css';
import Flash from '/img/flash.svg';
import Cog from '/img/cog.svg';
import React from 'react';

function getDescription(config) {
  const service = Object.keys(config)[0];
  if (service === 'custom') {
    return SERVICE_TO_NAME[service];
  }
  const type = Object.keys(config[service])[0];
  return SERVICE_TO_NAME[service][type];
}

function Logo({config}) {
  if (config.custom) {
    return <Flash width="19" style={{paddingTop: '5px', marginRight: '6px', marginLeft: '-10px'}} />;
  }
  if (config.openAI) {
    return <img src={openAILogo} width="17" style={{paddingTop: '6px', marginRight: '8px'}} />;
  }
  if (config.cohere) {
    return <img src={cohereLogo} width="26" style={{paddingTop: '1.5px', marginLeft: '-1px', marginRight: '3px'}} />;
  }
  if (config.azure) {
    return <img src={azureLogo} width="21" style={{paddingTop: '5px', marginRight: '6px'}} />;
  }
  if (config.huggingFace) {
    return <img src={huggingFaceLogo} width="24" style={{paddingTop: '2.5px', marginRight: '6px'}} />;
  }
  if (config.stabilityAI) {
    return <img src={stabilityAILogo} width="19" style={{paddingTop: '4.8px', marginRight: '6px'}} />;
  }
  if (config.assemblyAILogo) {
    return <img src={assemblyAILogo} width="17" style={{paddingTop: '5.5px', marginRight: '6px'}} />;
  }
  return <Cog width="19" style={{paddingTop: '5px', marginRight: '6px'}} />;
}

// The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children
const ChatWrapper = React.forwardRef(
  ({children, config, removeComponent, cloneComponent, setEditingChatRef, isAtEnd}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
      },
      scaleOut() {
        setScaleExpanded(false); // shrunk already has animation
      },
      remove() {
        setWidthExpanded(false);
      },
      getElement() {
        return elementRef.current;
      },
      scrollIntoView() {
        elementRef.current.scrollIntoView({block: 'center', behavior: 'smooth'});
      },
      isVisibleInParent(parentElement) {
        return isChildElementVisible(parentElement, elementRef.current);
      },
      getOffsetTop() {
        return elementRef.current.offsetTop;
      },
      config,
    }));

    function stretchOutOnMount() {
      setScaleExpanded(true);
      setTimeout(() => {
        setAllowAnimation(false); // animation needs to be unset as sortable needs to use it when dragging
      }, 500);
    }

    const elementRef = React.createRef(null);
    const [counter, setCounter] = React.useState(0); // this is used to re-render the component
    const [scaleExpanded, setScaleExpanded] = React.useState(false);
    const [widthExpanded, setWidthExpanded] = React.useState(isAtEnd);
    const [allowAnimation, setAllowAnimation] = React.useState(false);

    React.useEffect(() => {
      let isMounted = true;
      setTimeout(() => {
        if (!isMounted) return;
        setAllowAnimation(true);
        if (isAtEnd) {
          setScaleExpanded(true);
          stretchOutOnMount();
        } else {
          setWidthExpanded(true);
          setTimeout(() => stretchOutOnMount(), 200);
        }
      }); // in a timeout as otherwise if add button is spammed the animations will not show
      return () => {
        isMounted = false;
      };
    }, []);

    return (
      <div
        key={counter}
        ref={elementRef}
        className={`playground-chat-wrapper ${allowAnimation ? 'playground-chat-animated' : ''} ${
          scaleExpanded ? 'playground-chat-wrapper-scale-expanded' : 'playground-chat-wrapper-scale-shrunk'
        } ${widthExpanded ? 'playground-chat-wrapper-width-expanded' : 'playground-chat-wrapper-width-shrunk'}`}
      >
        {/* The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children */}
        {children}
        <div className="playground-chat-details">
          <div className="playground-chat-configure-button" onClick={() => setEditingChatRef(ref)}>
            <Logo config={config}></Logo>
          </div>
          <div className="playground-chat-description">{getDescription(config)}</div>
          {/* The button is going to turn into the active logo */}
          {/* <button onClick={() => setEditingChatRef(ref)}>Configure</button> */}
          {/* <button onClick={() => removeComponent(ref)}>Remove</button>
          <button onClick={() => cloneComponent(ref)}>Clone</button>
          <button onClick={() => cloneComponent(ref)}>Clear</button>
          <button className="playground-chat-drag-handle">Move</button> */}
        </div>
        {/* Option description for chat at bottom or at top */}
      </div>
    );
  }
);

export default ChatWrapper;

const SERVICE_TO_NAME = {
  demo: 'Default',
  custom: 'Service',
  openAI: {
    chat: 'OpenAI - Chat',
    completions: 'OpenAI - Completions',
    images: 'OpenAI - Dalle 2',
    audio: 'OpenAI - Whisper',
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

function isChildElementVisible(parentElement, childElement) {
  const parentRect = parentElement.getBoundingClientRect();
  const childRect = childElement.getBoundingClientRect();
  return (
    childRect.top >= parentRect.top &&
    childRect.bottom <= parentRect.bottom &&
    childRect.left >= parentRect.left &&
    childRect.right <= parentRect.right
  );
}
