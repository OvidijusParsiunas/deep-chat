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
        Send images, audio, gifs, spreadsheets and any other files to and from the target service. Text messages support{' '}
        <b>MarkDown</b> to help control text layout and render code.
      </div>
    </div>
  );
}

export default function Content() {
  return (
    <div id="customization">
      <div className="feature-sub-header" style={{marginTop: '150px'}}>
        Media and MarkDown
      </div>
      <div id="column-types">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
