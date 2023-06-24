import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './connect.css';

function RightPanel() {
  return (
    <div id="column-types-right">
      <div className="column-types-text">
        Deep Chat can connect to any API. You can use the default settings to connect to any of the available services or
        configure the setup to connect to your own service.
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
          {text: 'Where do I start?', role: 'user'},
          {text: 'See how to install with live examples in Docs.', role: 'ai'},
          {text: 'Can you connect to a custom API?', role: 'user'},
          {text: 'I sure can! Check the Service section in Docs.', role: 'ai'},
        ]}
        containerStyle={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          borderColor: '#ededed',
          marginLeft: '30px',
          marginRight: '30px',
        }}
        messageStyles={{
          default: {
            user: {
              bubble: {
                backgroundColor: '#32c132',
              },
            },
          },
        }}
        stream={true}
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
