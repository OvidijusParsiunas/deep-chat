import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './playgroundChatComponent.css';
import React from 'react';

function processDirectConfig(config) {
  if (config.demo) {
    return {demo: {response: {result: {text: "Click the 'Configure' button below to connect to a service."}}}};
  }
  return config;
}

export default function ChatComponent({config, messages, globalConfig}) {
  const componentRef = React.createRef(null);
  const [currentMessages] = React.useState(messages || []);

  // updating messages here to keep track of them so that when user moves to a different page they can be added to config
  function newestMessages({isInitial}) {
    if (!isInitial) {
      currentMessages.splice(0, currentMessages.length);
      currentMessages.push(...componentRef.current.children[0].getMessages());
    }
  }

  // when user moves to a different page, this is used to populate the latest messages
  React.useEffect(() => {
    return () => {
      globalConfig.components[globalConfig.components.length - 1].messages = currentMessages;
    };
  });

  return (
    <div ref={componentRef} className="playground-chat-component">
      {config.custom ? (
        <DeepChatBrowser
          request={config.custom}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            marginLeft: '10px',
            marginRight: '10px',
            width: '20vw',
          }}
          initialMessages={messages}
          onNewMessage={newestMessages}
        ></DeepChatBrowser>
      ) : (
        <DeepChatBrowser
          directConnection={processDirectConfig(config)}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            marginLeft: '10px',
            marginRight: '10px',
            width: '20vw',
          }}
          initialMessages={messages}
          onNewMessage={newestMessages}
        ></DeepChatBrowser>
      )}
    </div>
  );
}
