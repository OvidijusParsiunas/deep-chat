import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import {useColorMode} from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import './playgroundChatComponent.css';
import React from 'react';

const DEMO_RESPONSE = {response: {text: "Click the 'Configure' button below to connect to a service."}};

export default function ChatComponent({config}) {
  const componentRef = React.createRef(null);

  // updating messages here to keep track of them so that when user moves to a different page they can be added to config
  // to note componentRef.current will be undefined, hence need to keep track
  function onMessage({isHistory}) {
    if (!isHistory) {
      const deepChatComponent = componentRef.current.children[0];
      if (config.connect?.openAI?.assistant) assignOpenAIAssistantId(deepChatComponent, config);
      const {messages} = config;
      messages.splice(0, messages.length);
      messages.push(...deepChatComponent.getMessages());
    }
  }

  function onClearMessages() {
    config?.messages.splice(0, config.messages.length);
  }

  function getBoolean(object, name) {
    if (object[name]) {
      const resultBoolean = object[name];
      delete object[name]; // deleting as directConnection services use property in requests
      return resultBoolean;
    }
    const firstKey = Object.keys(object)[0] === 'key' ? Object.keys(object)[1] : Object.keys(object)[0];
    if (typeof object[firstKey] === 'object') {
      return getBoolean(object[firstKey], name);
    }
    return false;
  }

  function parseConfigProperties(config) {
    if (!config?.connect) return {connect: config?.connect};
    const connectCp = JSON.parse(JSON.stringify(config.connect));
    const allowImages = getBoolean(connectCp, 'allowImages');
    const allowCamera = getBoolean(connectCp, 'allowCamera');
    const allowGifs = getBoolean(connectCp, 'allowGifs');
    const allowAudio = getBoolean(connectCp, 'allowAudio');
    const allowMicrophone = getBoolean(connectCp, 'allowMicrophone');
    const allowMixedFiles = getBoolean(connectCp, 'allowMixedFiles');
    return {connect: connectCp, allowImages, allowCamera, allowGifs, allowAudio, allowMicrophone, allowMixedFiles};
  }

  function getWebModelConfig(webModelConfig) {
    const defaultConfig = {load: {onMessage: true}};
    const customConfig = typeof webModelConfig === 'boolean' ? {} : webModelConfig;
    return Object.assign(defaultConfig, customConfig);
  }

  return (
    <BrowserOnly>
      {() => {
        // colorMode tracked in in wrapper because component would otherwise
        // not update properly as styles overwrite each other
        const {colorMode} = useColorMode();
        const {connect, allowImages, allowCamera, allowGifs, allowAudio, allowMicrophone, allowMixedFiles} =
          parseConfigProperties(config);
        if (colorMode === 'dark') {
          return (
            <div ref={componentRef} className="playground-chat-component">
              {config?.connect?.custom ? (
                <DeepChatBrowser
                  connect={connect.custom}
                  images={allowImages}
                  camera={allowCamera}
                  gifs={allowGifs}
                  audio={allowAudio}
                  microphone={allowMicrophone}
                  mixedFiles={allowMixedFiles}
                  style={darkContainerStyle}
                  messageStyles={darkMessageStyles}
                  history={config.messages}
                  onMessage={onMessage}
                  onClearMessages={onClearMessages}
                  textInput={darkTextInput}
                  submitButtonStyles={darkButtonStyles}
                  auxiliaryStyle={darkAuxiliaryStyle}
                  introPanelStyle={darkPanelStyle}
                ></DeepChatBrowser>
              ) : config?.connect?.demo ? (
                <DeepChatBrowser
                  demo={DEMO_RESPONSE}
                  style={darkContainerStyle}
                  messageStyles={darkMessageStyles}
                  history={config.messages}
                  onMessage={onMessage}
                  onClearMessages={onClearMessages}
                  textInput={darkTextInput}
                  submitButtonStyles={darkButtonStyles}
                  auxiliaryStyle={darkAuxiliaryStyle}
                  introPanelStyle={darkPanelStyle}
                ></DeepChatBrowser>
              ) : config?.connect?.webModel ? (
                <DeepChatBrowser
                  webModel={getWebModelConfig(config.connect.webModel)}
                  style={darkContainerStyle}
                  messageStyles={darkMessageStyles}
                  history={config.messages}
                  onMessage={onMessage}
                  onClearMessages={onClearMessages}
                ></DeepChatBrowser>
              ) : (
                <DeepChatBrowser
                  directConnection={connect}
                  images={allowImages}
                  camera={allowCamera}
                  gifs={allowGifs}
                  audio={allowAudio}
                  microphone={allowMicrophone}
                  mixedFiles={allowMixedFiles}
                  style={darkContainerStyle}
                  messageStyles={darkMessageStyles}
                  history={config.messages}
                  onMessage={onMessage}
                  onClearMessages={onClearMessages}
                  textInput={darkTextInput}
                  submitButtonStyles={darkButtonStyles}
                  auxiliaryStyle={darkAuxiliaryStyle}
                  introPanelStyle={darkPanelStyle}
                ></DeepChatBrowser>
              )}
            </div>
          );
        }

        return (
          <div ref={componentRef} className="playground-chat-component">
            {config?.connect?.custom ? (
              <DeepChatBrowser
                connect={connect.custom}
                images={allowImages}
                camera={allowCamera}
                gifs={allowGifs}
                audio={allowAudio}
                microphone={allowMicrophone}
                mixedFiles={allowMixedFiles}
                style={lightContainerStyle}
                history={config.messages}
                onMessage={onMessage}
                onClearMessages={onClearMessages}
              ></DeepChatBrowser>
            ) : config?.connect?.demo ? (
              <DeepChatBrowser
                demo={DEMO_RESPONSE}
                style={lightContainerStyle}
                history={config.messages}
                onMessage={onMessage}
                onClearMessages={onClearMessages}
              ></DeepChatBrowser>
            ) : config?.connect?.webModel ? (
              <DeepChatBrowser
                webModel={getWebModelConfig(config.connect.webModel)}
                style={lightContainerStyle}
                history={config.messages}
                onMessage={onMessage}
                onClearMessages={onClearMessages}
              ></DeepChatBrowser>
            ) : (
              <DeepChatBrowser
                directConnection={connect}
                images={allowImages}
                camera={allowCamera}
                gifs={allowGifs}
                audio={allowAudio}
                microphone={allowMicrophone}
                mixedFiles={allowMixedFiles}
                style={lightContainerStyle}
                history={config.messages}
                onMessage={onMessage}
                onClearMessages={onClearMessages}
              ></DeepChatBrowser>
            )}
          </div>
        );
      }}
    </BrowserOnly>
  );
}

const darkContainerStyle = {
  borderRadius: '10px',
  boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
  border: '1px solid #ededed',
  marginLeft: '10px',
  border: 'unset',
  marginRight: '10px',
  width: '302px',
  backgroundColor: '#2e2e2e',
};

const darkMessageStyles = {
  default: {
    ai: {bubble: {backgroundColor: '#545454', color: 'white'}},
  },
  loading: {
    bubble: {backgroundColor: '#545454', color: 'white'},
  },
};

const darkTextInput = {
  styles: {
    container: {
      backgroundColor: '#4e4e4e',
      border: 'unset',
      color: '#e8e8e8',
    },
  },
  placeholder: {style: {color: '#bcbcbc'}},
};

const darkButtonStyles = {
  submit: {
    container: {
      default: {bottom: '0.7rem'},
    },
    svg: {
      styles: {
        default: {
          filter:
            'brightness(0) saturate(100%) invert(70%) sepia(52%) saturate(5617%) hue-rotate(185deg) brightness(101%) contrast(101%)',
        },
      },
    },
  },
};

const darkAuxiliaryStyle = `
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: grey;
    border-radius: 5px;
  }
  ::-webkit-scrollbar-track {
    background-color: unset;
  }`;

const darkPanelStyle = {backgroundColor: '#4f4f4f', color: 'white', border: 'unset'};

const lightContainerStyle = {
  borderRadius: '10px',
  boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
  border: '1px solid #ededed',
  marginLeft: '10px',
  marginRight: '10px',
  width: '302px',
};

function assignOpenAIAssistantId(deepChatComponent, config) {
  if (deepChatComponent._activeService.rawBody.assistant_id) {
    if (typeof config.connect.openAI.assistant === 'boolean') {
      config.connect.openAI.assistant = {assistant_id: deepChatComponent._activeService.rawBody.assistant_id};
    } else if (!config.connect.openAI.assistant.assistant_id) {
      config.connect.openAI.assistant.assistant_id = deepChatComponent._activeService.rawBody.assistant_id;
    }
  }
}
