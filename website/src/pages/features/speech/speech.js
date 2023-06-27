import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './speech.css';

function TriggerOnVisibile(props) {
  const domRef = React.useRef();
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setVisible(true), 300);
        observer.unobserve(domRef.current);
      }
    });
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={domRef} className={isVisible ? 'speech-content-visible' : 'speech-content-hidden'}>
      {props.children}
    </div>
  );
}

function RightPanel() {
  return (
    <div id="speech-panel-right">
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
        }}
        microphone={true}
      ></DeepChatBrowser>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="speech-panel-left">
      <div className="speech-text">
        Input your text using real time speech to text transcription and have the response messages automatically read out
        using text to speech synthesis.
      </div>
    </div>
  );
}

export default function Speech() {
  return (
    <div
      id="speech"
      style={{
        background: 'linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(255,224,224,1) 100%)',
        marginBottom: '150px',
      }}
    >
      <TriggerOnVisibile>
        <div className="feature-sub-header" style={{paddingTop: '40px'}}>
          Enhance chat with Speech
        </div>
        <div id="speech-content">
          <LeftPanel></LeftPanel>
          <RightPanel></RightPanel>
        </div>
      </TriggerOnVisibile>
    </div>
  );
}
