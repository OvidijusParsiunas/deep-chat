import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './playgroundChatComponent.css';
import React from 'react';

function processConnectObject(connect) {
  if (connect.demo) {
    return {demo: {response: {result: {text: "Click the 'Configure' button below to connect to a service."}}}};
  }
  return connect;
}

export default function ChatComponent({config}) {
  const componentRef = React.createRef(null);

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

  return (
    <div ref={componentRef} className="playground-chat-component">
      {config.connect.custom ? (
        <DeepChatBrowser
          request={config.connect.custom}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            marginLeft: '10px',
            marginRight: '10px',
            width: '20vw',
          }}
          initialMessages={config.messages}
          onNewMessage={newestMessages}
          onClearMessages={clearMessages}
        ></DeepChatBrowser>
      ) : (
        <DeepChatBrowser
          directConnection={processConnectObject(config.connect)}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            marginLeft: '10px',
            marginRight: '10px',
            width: '20vw',
          }}
          initialMessages={config.messages}
          onNewMessage={newestMessages}
          onClearMessages={clearMessages}
        ></DeepChatBrowser>
      )}
    </div>
  );
}
