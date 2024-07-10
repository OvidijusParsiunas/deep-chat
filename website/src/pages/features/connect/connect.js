import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import OnVisibleAnimation from '../../utils/onVisibleAnimation';
import React from 'react';
import './connect.css';

function RightPanel() {
  return (
    <div id="connect-right-panel" className="feature-panel">
      <div id="connect-text">
        Deep Chat can connect to any API. Use it to communicate with popular AI providers directly from the browser or
        configure it to connect to your own servers.
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="connect-left-panel" className="feature-panel">
      <DeepChatBrowser
        demo={true}
        history={[
          {text: 'Where do I start?', role: 'user'},
          {text: 'Check Docs on how to install this component.', role: 'ai'},
          {text: 'Can it connect to my custom API?', role: 'user'},
          {text: 'It sure can! Check the Connect section in Docs.', role: 'ai'},
        ]}
        style={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          border: '1px solid #ededed',
        }}
        messageStyles={{
          default: {
            user: {
              bubble: {
                backgroundColor: '#397cd8',
              },
            },
          },
        }}
        connect={{stream: true}}
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
