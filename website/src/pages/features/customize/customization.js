import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './customization.css';
import React from 'react';

export default function Customize() {
  return (
    <div id="customization">
      <div className="feature-sub-header" style={{marginBottom: '60px'}}>
        Customize with no limits
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
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
    </div>
  );
}
