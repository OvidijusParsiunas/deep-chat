import PreloadImages from './preloadImages';
import PreloadFont from './preloadFont';
import React from 'react';

// this is an optimization approach to stop images rendering whilst they are being displayed and the component text from changing
export default function Preload() {
  return (
    <div>
      <PreloadFont></PreloadFont>
      <PreloadImages></PreloadImages>
    </div>
  );
}
