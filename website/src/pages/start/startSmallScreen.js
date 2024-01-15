import Options from './options';
import './startSmallScreen.css';
import React from 'react';

export default function StartSmallScreen() {
  return (
    <div id="start-page-small-screen">
      <Options
        options={[
          {text: 'Setup the component', link: 'https://deepchat.dev/docs/installation'},
          {text: 'Connect to a popular AI API', link: 'https://deepchat.dev/docs/directConnection'},
          {text: 'Connect to a custom API', link: 'https://deepchat.dev/docs/connect'},
          {text: 'AI in your browser', link: 'https://deepchat.dev/docs/webModel'},
        ]}
      ></Options>
    </div>
  );
}
