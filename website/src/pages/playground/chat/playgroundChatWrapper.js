import PlaygroundChatWrapperConfig from './playgroundChatWrapperConfig';
import ChatWrapperText from './playgroundChatWrapperText';
import Logo from './playgroundChatWrapperLogo';
import './playgroundChatWrapper.css';
import React from 'react';

// The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children
const ChatWrapper = React.forwardRef(
  ({children, config, removeComponent, cloneComponent, setEditingChatRef, isAtEnd, playgroundConfig}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
        config.messages.splice(0, config.messages.length); // these are initial messages from the config, remove when changing connection object
        if (!descriptionRef.current.getDirty()) {
          setDescriptionText(getDescription(config.connect));
        }
      },
      scaleOut() {
        setScaleExpanded(false); // shrunk already has animation
      },
      reduceHeightWhenLastOnRow() {
        const previousSibling = elementRef.current.previousSibling;
        if (!elementRef.current.nextSibling && previousSibling) {
          if (previousSibling.offsetTop !== elementRef.current.offsetTop) {
            setHeightExpanded(false);
          }
        }
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
      getMessages() {
        return elementRef.current.children[0].children[0].getMessages();
      },
      config,
      connect: config.connect,
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
    const [heightExpanded, setHeightExpanded] = React.useState(true);
    const [allowAnimation, setAllowAnimation] = React.useState(false);
    const descriptionRef = React.useRef(null);
    // need to use state for input
    // tracked here as otherwise re-rendering component would re-render description
    const [description, setDescription] = React.useState(config.description);

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

    function setDescriptionText(text) {
      config.description = text;
      setDescription(text);
    }

    function clearMessages() {
      elementRef.current.children[0].children[0].clearMessages();
    }

    return (
      <div
        key={counter}
        ref={elementRef}
        className={`playground-chat-wrapper ${allowAnimation ? 'playground-chat-animated' : ''} ${
          scaleExpanded ? 'playground-chat-wrapper-scale-expanded' : 'playground-chat-wrapper-scale-shrunk'
        } ${widthExpanded ? 'playground-chat-wrapper-width-expanded' : 'playground-chat-wrapper-width-shrunk'} ${
          heightExpanded ? '' : 'playground-chat-wrapper-height-shrunk'
        }`}
      >
        {/* The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children */}
        {children}
        <div className="playground-chat-details">
          <div className="playground-chat-description">
            <Logo connect={config.connect}></Logo>
            <ChatWrapperText
              ref={descriptionRef}
              textValue={description}
              setTextValue={setDescriptionText}
            ></ChatWrapperText>
          </div>
          <PlaygroundChatWrapperConfig
            setEditingChatRef={setEditingChatRef}
            cloneComponent={cloneComponent}
            removeComponent={removeComponent}
            clearMessages={clearMessages}
            wrapperRef={ref}
          />
        </div>
      </div>
    );
  }
);

export default ChatWrapper;

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

function getDescription(connect) {
  const service = Object.keys(connect)[0];
  if (service === 'custom') {
    return SERVICE_TO_NAME[service];
  }
  const keys = Object.keys(connect[service]);
  return SERVICE_TO_NAME[service][keys[0] === 'key' ? keys[1] : keys[0]];
}

const SERVICE_TO_NAME = {
  demo: 'Default',
  custom: 'Service',
  openAI: {
    chat: 'OpenAI: Chat',
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
