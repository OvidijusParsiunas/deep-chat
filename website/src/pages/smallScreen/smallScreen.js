import DeepChatBrowser from '../../components/table/deepChatBrowser';
import './smallScreen.css';
import React from 'react';

export default function SmallScreenPanel() {
  return (
    <div id="small-screen-component">
      <DeepChatBrowser
        directConnection={{demo: true}}
        initialMessages={[
          {text: 'What is Deep Chat?', role: 'user'},
          {text: 'A framework agnostic chat component.', role: 'ai'},
          {text: 'What exactly can it be used for?', role: 'user'},
          {text: 'Add it to your website to connect to AI APIs.', role: 'ai'},
        ]}
        containerStyle={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          borderColor: '#ededed',
          zIndex: 10,
        }}
        stream="true"
      ></DeepChatBrowser>
    </div>
  );
}
