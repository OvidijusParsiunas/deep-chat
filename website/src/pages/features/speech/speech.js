import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import OnVisibleAnimation from '../../utils/onVisibleAnimation';
import React from 'react';
import './speech.css';

function RightPanel() {
  return (
    <div id="speech-right-panel" className="feature-panel">
      <DeepChatBrowser
        demo={true}
        history={[
          {text: 'What is speech to text?', role: 'user'},
          {text: 'Transcribe your voice via the microphone button.', role: 'ai'},
          {text: 'Ok, then how does text to speech work?', role: 'user'},
          {text: 'Send a message and listen to the response.', role: 'ai'},
        ]}
        style={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          border: '1px solid #ededed',
        }}
        textToSpeech={true}
        speechToText={true}
        connect={{stream: true}}
      ></DeepChatBrowser>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="speech-left-panel" className="feature-panel">
      <div id="speech-text">
        Input your text using real time speech to text transcription and have the responses read out to you automatically
        using text to speech synthesis.
      </div>
    </div>
  );
}

export default function Speech() {
  return (
    <div id="speech">
      <OnVisibleAnimation beforeClass={'speech-panels-hidden'} afterClass={'speech-panels-visible'} timeoutMS={300}>
        <div id="speech-sub-header" className="feature-sub-header">
          Enhance chat with Speech
        </div>
        <div id="speech-content">
          <LeftPanel></LeftPanel>
          <RightPanel></RightPanel>
        </div>
      </OnVisibleAnimation>
    </div>
  );
}
