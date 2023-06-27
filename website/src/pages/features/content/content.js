import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './content.css';

function TriggerOnVisibile(props) {
  const domRef = React.useRef();
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setVisible(true));
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
            {file: {src: '/img/bird.jpeg', type: 'image'}, role: 'user'},
            {file: {src: '/audio/cantinaBand.wav', type: 'audio'}, role: 'user'},
            {text: '```java\nconsole.log("hello world");\n```', role: 'ai'},
          ]}
          images={true}
          gifs={true}
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
    <div>
      <div
        id="content-diagonal"
        style={{height: '382px', backgroundColor: '#ffefef', paddingTop: '30px', marginTop: '200px'}}
      ></div>
      <div
        id="customization"
        style={{
          height: '382px',
          backgroundColor: '#ffefef',
          marginTop: '-300px',
          paddingTop: '30px',
          position: 'absolute',
        }}
      >
        <div className="feature-sub-header">Transfer Media and MarkDown</div>
        <div id="content">
          <LeftPanel></LeftPanel>
          <RightPanel></RightPanel>
        </div>
      </div>
    </div>
  );
}
