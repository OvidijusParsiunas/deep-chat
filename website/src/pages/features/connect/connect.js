import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import OnVisibleAnimation from '../../utils/onVisibleAnimation';
import React from 'react';
import './connect.css';

function RightPanel() {
  return (
    <div id="connect-right-panel" className="feature-panel">
      <div id="connect-text">
        Deep Chat can connect to any API. You can use the default settings to connect to any of the predefined services or
        configure the setup to connect to your own service.
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="connect-left-panel" className="feature-panel">
      <DeepChatBrowser
        directConnection={{demo: true}}
        initialMessages={[
          {text: 'Where do I start?', role: 'user'},
          {text: 'Check Docs on how to install this component.', role: 'ai'},
          {text: 'Can it connect to my custom API?', role: 'user'},
          {text: 'It sure can! Check the Service section in Docs.', role: 'ai'},
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
    <div id="connect">
      <div className="feature-sub-header">Connect to any service</div>
      <OnVisibleAnimation beforeClass={''} afterClass={'connect-panels-close'}>
        <div id="connect-panels">
          <LeftPanel></LeftPanel>
          <RightPanel></RightPanel>
        </div>
      </OnVisibleAnimation>
    </div>
  );
}
