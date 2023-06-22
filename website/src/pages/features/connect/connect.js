import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './connect.css';

function RightPanel() {
  return (
    <div id="column-types-right">
      <div className="column-types-text">
        Deep Chat can connect to any API. You can use the default options for any of the existing services or configure
        your own setup to connect to your own service.
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="column-types-left">
      <DeepChatBrowser
        existingService={{demo: true}}
        initialMessages={[
          {text: 'Hey, how are you?', role: 'user'},
          {text: 'I am doing great, how about you?', role: 'ai'},
          {text: 'What is the meaning of life?', role: 'user'},
          {
            text: 'This depends on the person.',
            role: 'ai',
          },
        ]}
        containerStyle={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          borderColor: '#ededed',
          marginLeft: '30px',
          marginRight: '30px',
        }}
      ></DeepChatBrowser>
    </div>
  );
}

export default function Connect() {
  return (
    <div id="customization">
      <div className="feature-sub-header" style={{marginTop: '150px'}}>
        Connect to any service
      </div>
      <div id="column-types">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
