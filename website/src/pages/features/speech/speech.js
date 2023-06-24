import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './speech.css';
import React from 'react';

function RightPanel() {
  return (
    <div id="column-types-right">
      <div className="column-types-text">
        Input your text using real time speech to text transcription and have the response messages automatically read out
        using text to speech synthesis.
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
          {text: 'This depends on the person.', role: 'ai'},
        ]}
        containerStyle={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          borderColor: '#ededed',
          marginLeft: '30px',
          marginRight: '30px',
        }}
        microphone={true}
      ></DeepChatBrowser>
    </div>
  );
}

export default function Speech() {
  return (
    <div id="customization">
      <div className="feature-sub-header" style={{marginTop: '150px'}}>
        Enhance chat with Speech
      </div>
      <div id="column-types">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
