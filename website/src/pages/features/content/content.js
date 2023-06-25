import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './content.css';

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
    <div ref={domRef} className={isVisible ? 'content-top' : 'content-bottom'}>
      {props.children}
    </div>
  );
}

function RightPanel() {
  return (
    <div id="content-right">
      <TriggerOnVisibile>
        <DeepChatBrowser
          existingService={{demo: true}}
          containerStyle={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            borderColor: '#ededed',
            height: '400px',
          }}
          messageStyles={{
            default: {
              user: {
                bubble: {
                  maxWidth: '90%',
                  backgroundColor: '#e4e6eb',
                  marginRight: '10px',
                },
              },
              ai: {
                bubble: {
                  maxWidth: '90%',
                  marginLeft: '10px',
                },
              },
            },
            audio: {
              user: {
                bubble: {
                  width: '70%',
                  backgroundColor: 'white',
                },
              },
            },
            image: {
              user: {
                bubble: {
                  maxWidth: '70%',
                  marginTop: '14px',
                },
              },
            },
          }}
          initialMessages={[
            {file: {src: '/img/linus.jpg', type: 'image'}, role: 'user'},
            {file: {src: '/audio/cantinaBand.wav', type: 'audio'}, role: 'user'},
            {text: '```java\nconsole.log("hello world");\n```', role: 'ai'},
          ]}
          images={true}
          audio={true}
          mixedFiles={true}
          dropupStyles={{
            button: {
              position: 'outside-right',
            },
          }}
        ></DeepChatBrowser>
      </TriggerOnVisibile>
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
    <div id="customization" style={{height: '382px', backgroundColor: '#ffd1d1', marginTop: '150px', paddingTop: '50px'}}>
      <div className="feature-sub-header">Transfer Media and MarkDown</div>
      <div id="content">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
