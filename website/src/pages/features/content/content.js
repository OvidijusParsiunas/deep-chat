import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './content.css';
import React from 'react';

function RightPanel() {
  return (
    <div id="content-right">
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

function LeftPanel() {
  return (
    <div id="content-left">
      <div className="column-types-text">
        Send image, audio, gif, spreadsheet and any other files types to and from the target service. Message text is also
        supported by <b>Mark Down</b> to allow transcription of code and other style configuration.
      </div>
    </div>
  );
}

export default function Content() {
  return (
    <div id="customization">
      <div className="feature-sub-header" style={{marginTop: '150px'}}>
        Send and Receive any Content
      </div>
      <div id="column-types">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
