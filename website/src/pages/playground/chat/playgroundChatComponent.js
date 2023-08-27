import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './playgroundChatComponent.css';
import React from 'react';

export default function ChatComponent({config}) {
  return (
    <div className="playground-chat-component">
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
        ></DeepChatBrowser>
      ) : (
        <DeepChatBrowser
          directConnection={config}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            marginLeft: '10px',
            marginRight: '10px',
            width: '20vw',
          }}
        ></DeepChatBrowser>
      )}
    </div>
  );
}
