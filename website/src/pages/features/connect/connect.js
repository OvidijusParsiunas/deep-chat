import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './connect.css';

function TriggerOnVisibile(props) {
  const domRef = React.useRef();
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setVisible(true), 100);
        observer.unobserve(domRef.current);
      }
    });
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={domRef} className={isVisible ? 'animation-class' : 'not-animation-class'}>
      {props.children}
    </div>
  );
}

function RightPanel() {
  return (
    <div id="connect-right-panel">
      <div className="connect-right-panel-text">
        Deep Chat can connect to any API. You can use the default settings to connect to any of the available services or
        configure the setup to connect to your own service.
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="connect-left-panel">
      <DeepChatBrowser
        existingService={{demo: true}}
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
    <div id="customization">
      <div className="feature-sub-header" style={{marginTop: '150px'}}>
        Connect to any service
      </div>
      <TriggerOnVisibile>
        <div id="column-types">
          <LeftPanel></LeftPanel>
          <RightPanel></RightPanel>
        </div>
      </TriggerOnVisibile>
    </div>
  );
}
