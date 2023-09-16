import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import {useColorMode} from '@docusaurus/theme-common';
import './playgroundChatComponent.css';
import React from 'react';

// TO-DO - ability to stream chat and dark mode for stop button
function processConnectObject(connect) {
  if (connect.demo) {
    return {demo: {response: {text: "Click the 'Configure' button below to connect to a service."}}};
  }
  return connect;
}

export default function ChatComponent({config}) {
  const componentRef = React.createRef(null);
  const {colorMode} = useColorMode();

  // updating messages here to keep track of them so that when user moves to a different page they can be added to config
  // to note componentRef.current will be undefined, hence need to keep track
  function newestMessages({isInitial}) {
    if (!isInitial) {
      const {messages} = config;
      messages.splice(0, messages.length);
      messages.push(...componentRef.current.children[0].getMessages());
    }
  }

  function clearMessages() {
    config.messages.splice(0, config.messages.length);
  }

  // the updated is performed in the wrapper because resetting the component here does not update the component itself properly as styles overwrite each other
  if (colorMode === 'dark') {
    return (
      <div ref={componentRef} className="playground-chat-component">
        {config.connect.custom ? (
          <DeepChatBrowser
            request={config.connect.custom}
            containerStyle={darkContainerStyle}
            messageStyles={darkMessageStyles}
            initialMessages={config.messages}
            onNewMessage={newestMessages}
            onClearMessages={clearMessages}
            textInput={darkTextInput}
            submitButtonStyles={darkButtonStyles}
            auxiliaryStyle={darkAuxiliaryStyle}
            introPanelStyle={darkPanelStyle}
          ></DeepChatBrowser>
        ) : (
          <DeepChatBrowser
            directConnection={processConnectObject(config.connect)}
            containerStyle={darkContainerStyle}
            messageStyles={darkMessageStyles}
            initialMessages={config.messages}
            onNewMessage={newestMessages}
            onClearMessages={clearMessages}
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
      {config.connect.custom ? (
        <DeepChatBrowser
          request={config.connect.custom}
          containerStyle={lightContainerStyle}
          initialMessages={config.messages}
          onNewMessage={newestMessages}
          onClearMessages={clearMessages}
        ></DeepChatBrowser>
      ) : (
        <DeepChatBrowser
          directConnection={processConnectObject(config.connect)}
          containerStyle={lightContainerStyle}
          initialMessages={config.messages}
          onNewMessage={newestMessages}
          onClearMessages={clearMessages}
        ></DeepChatBrowser>
      )}
    </div>
  );
}

const darkContainerStyle = {
  borderRadius: '10px',
  boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
  borderColor: '#ededed',
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
  loading: {
    container: {
      default: {backgroundColor: 'unset'},
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
  stop: {
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
  borderColor: '#ededed',
  marginLeft: '10px',
  marginRight: '10px',
  width: '302px',
};
