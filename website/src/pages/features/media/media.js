import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import OnVisibleAnimation from '../../utils/onVisibleAnimation';
import hljs from 'highlight.js';
import React from 'react';
import './media.css';

function RightPanel() {
  const chatElementRef = React.useRef(null);
  React.useEffect(() => {
    setTimeout(() => {
      window.hljs = hljs;
      const chatElement = chatElementRef.current?.children[0].children[0];
      chatElement.current?.refreshMessages();
    }, 10);
  }, []);

  return (
    <div id="media-panel-right" ref={chatElementRef} className="feature-panel">
      <OnVisibleAnimation beforeClass={'media-bottom'} afterClass={'media-top'} timeoutMS={0}>
        <DeepChatBrowser
          demo={true}
          style={{
            borderRadius: '10px',
            boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
            border: '1px solid #ededed',
            height: '400px',
          }}
          messageStyles={{
            default: {
              user: {
                bubble: {
                  maxWidth: '90%',
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
          history={[
            {files: [{src: '/img/bird.jpeg', type: 'image'}], role: 'user'},
            {files: [{src: '/audio/cantinaBand.wav', type: 'audio'}], role: 'user'},
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
      </OnVisibleAnimation>
    </div>
  );
}

function LeftPanel() {
  return (
    <div id="media-panel-left" className="feature-panel">
      <div id="media-text">
        Send images, audio, gifs, spreadsheets and other files to and from the chat. Text messages support <b>MarkDown</b>{' '}
        to help control text layout and render code.
      </div>
    </div>
  );
}

export default function Media() {
  return (
    <div>
      <div id="media-diagonal-padding"></div>
      <div id="media">
        <div className="feature-sub-header">Transfer Media and MarkDown</div>
        <div id="media-panels">
          <LeftPanel></LeftPanel>
          <RightPanel></RightPanel>
        </div>
      </div>
    </div>
  );
}
