import React from 'react';
import './resizer.css';

function mouseDown(mouseClick) {
  mouseClick.isClicked = true;
}

function ResizerDots({style}) {
  return (
    <div className="responsive-design-resizer-handle-dots" style={style}>
      <div className="responsive-design-resizer-handle-dot"></div>
      <div className="responsive-design-resizer-handle-dot"></div>
      <div className="responsive-design-resizer-handle-dot"></div>
    </div>
  );
}

export default function Resizer(props) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      id="responsive-design-resizer-container"
      onMouseDown={mouseDown.bind(this, props.mouseClick)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div id="responsive-design-resizer" style={{backgroundColor: hovered ? '#46a0ff' : '#909090'}}></div>
      <div id="responsive-design-resizer-handle" style={{backgroundColor: hovered ? '#2d8bed' : '#757575'}}>
        <div id="responsive-design-resizer-handle-dot-container">
          <ResizerDots style={{float: 'left'}}></ResizerDots>
          <ResizerDots style={{float: 'right'}}></ResizerDots>
        </div>
      </div>
    </div>
  );
}
