import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './content.css';
import React from 'react';

function RightPanel() {
  return (
    <div id="content-right">
      <DeepChatBrowser
        existingService={{demo: true}}
        containerStyle={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          borderColor: '#ededed',
          marginLeft: '30px',
          marginRight: '30px',
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
          {file: {src: '/img/city.jpeg', type: 'image'}, role: 'user'},
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
    <div id="customization" style={{height: '350px'}}>
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
