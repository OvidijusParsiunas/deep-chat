import PlaygroundChatWrapperConfig from './playgroundChatWrapperConfig';
import ChatWrapperText from './playgroundChatWrapperText';
import {useColorMode} from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Logo from './playgroundChatWrapperLogo';
import './playgroundChatWrapper.css';
import React from 'react';

// The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children
const ChatWrapper = React.forwardRef(
  ({children, config, removeComponent, cloneComponent, setEditingChatRef, isAtEnd}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
        config.messages.splice(0, config.messages.length); // these are history messages from the config, remove when changing connection object
        if (!descriptionRef.current.getDirty()) {
          setDescriptionText(getDescription(config.connect));
        }
      },
      scaleOut() {
        setScaleExpanded(false); // shrunk already has animation
      },
      reduceHeight(isOnlyComponent) {
        if (!isOnlyComponent) setHeightExpanded(false);
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
      <BrowserOnly>
        {() => {
          // colorMode tracked and updated here because component would otherwise not update properly as styles overwrite each other
          const {colorMode} = useColorMode();
          React.useEffect(() => {
            setCounter(counter + 1);
          }, [colorMode]);
          return (
            <div
              key={counter}
              ref={elementRef}
              className={`playground-chat-wrapper ${allowAnimation ? 'playground-chat-animated' : ''} ${
                scaleExpanded ? 'playground-chat-wrapper-scale-expanded' : 'playground-chat-wrapper-scale-shrunk'
              } ${widthExpanded ? 'playground-chat-wrapper-width-expanded' : 'playground-chat-wrapper-width-shrunk'} ${
                heightExpanded ? 'playground-chat-wrapper-height-expanded' : 'playground-chat-wrapper-height-shrunk'
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
        }}
      </BrowserOnly>
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
  if (service === 'custom' || service === 'webModel') {
    return SERVICE_TO_NAME[service];
  }
  const keys = Object.keys(connect[service]);
  return SERVICE_TO_NAME[service][keys[0] === 'key' ? keys[1] : keys[0]];
}

const SERVICE_TO_NAME = {
  demo: 'Default',
  custom: 'Service',
  webModel: 'Web Model',
  openAI: {
    chat: 'OpenAI: Chat',
    assistant: 'OpenAI: Assistant',
    images: 'OpenAI: Dalle',
    textToSpeech: 'OpenAI: Text To Speech',
    speechToText: 'OpenAI: Speech To Text',
  },
  cohere: {
    chat: 'Cohere: Chat',
    textGeneration: 'Cohere: Text Generation',
    summarization: 'Cohere: Summarization',
  },
  huggingFace: {
    conversation: 'Hugging Face: Conversation',
    textGeneration: 'Hugging Face: Text Generation',
    summarization: 'Hugging Face: Summarization',
    translation: 'Hugging Face: Translation',
    fillMask: 'Hugging Face: Fill Mask',
    questionAnswer: 'Hugging Face: Question Answer',
    audioSpeechRecognition: 'Hugging Face: Speech Recognition',
    audioClassification: 'Hugging Face: Audio Classification',
    imageClassification: 'Hugging Face: Image Classification',
  },
  azure: {
    textToSpeech: 'Azure: Text To Speech',
    speechToText: 'Azure: Speech To Text',
    summarization: 'Azure: Summarization',
    translation: 'Azure: Translation',
  },
  stabilityAI: {
    textToImage: 'StabilityAI: Text To Image',
    imageToImage: 'StabilityAI: Image To Image',
    imageToImageMasking: 'StabilityAI: Image To Image Masking',
    imageToImageUpscale: 'StabilityAI: Image To Image Upscale',
  },
  assemblyAI: {
    audio: 'AssemblyAI: Audio',
  },
};
