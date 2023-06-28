import CaptureFiles from './captureFiles/captureFiles';
import Customize from './customize/customize';
import Connect from './connect/connect';
import Speech from './speech/speech';
import Media from './media/media';
import React from 'react';
import './features.css';

export default function Features() {
  return (
    <div id="features-container">
      <Connect></Connect>
      <Media></Media>
      <CaptureFiles></CaptureFiles>
      <Speech></Speech>
      <Customize></Customize>
    </div>
  );
}
