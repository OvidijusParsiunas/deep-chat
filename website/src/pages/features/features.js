import CaptureFiles from './captureFiles/captureFiles';
import Customize from './customize/customization';
import Content from './content/content';
import Connect from './connect/connect';
import Speech from './speech/speech';
import React from 'react';
import './features.css';

export default function Features() {
  return (
    <div id="features-container">
      <Connect></Connect>
      <Customize></Customize>
      <CaptureFiles></CaptureFiles>
      <Content></Content>
      <Speech></Speech>
    </div>
  );
}
