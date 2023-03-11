import ActiveTableBrowser from '../../../components/table/activeTableBrowser';
import Resizer from './resizer';
import './responsiveDesign.css';
import React from 'react';

function mouseMoving(mouseClick, leftTableRef, rightTableRef, event) {
  if (mouseClick.isClicked) {
    mouseClick.offset += event.movementX;
    leftTableRef.current.style.width = `calc(50% + ${mouseClick.offset - 20}px)`;
    rightTableRef.current.style.width = `calc(50% + ${-mouseClick.offset - 20}px)`;
  }
}

function mouseUp(mouseClick) {
  mouseClick.isClicked = false;
}

const Panel = React.forwardRef((_, ref) => (
  <div className="responsive-design-panel" ref={ref}>
    <ActiveTableBrowser
      tableStyle={{borderRadius: '5px', width: '100%'}}
      content={[
        ['Planet', 'Diameter', 'Mass', 'Moons'],
        ['Earth', 12756, 5.97, 1],
        ['Mars', 6792, 0.642, 2],
        ['Jupiter', 142984, 1898, 79],
        ['Neptune', 49528, 102, 14],
      ]}
    ></ActiveTableBrowser>
  </div>
));

export default function ResponsiveDesign() {
  const mouseClick = {isClicked: false, offset: 0};
  const leftTableRef = React.useRef(null);
  const rightTableRef = React.useRef(null);
  return (
    <div
      id="responsive-design"
      onMouseMove={mouseMoving.bind(this, mouseClick, leftTableRef, rightTableRef)}
      onMouseUp={mouseUp.bind(this, mouseClick)}
    >
      <div className="feature-sub-header">Responsive design</div>
      <div style={{display: 'flex', marginTop: '20px'}}>
        <Panel ref={leftTableRef}></Panel>
        <Resizer mouseClick={mouseClick}></Resizer>
        <Panel ref={rightTableRef}></Panel>
      </div>
    </div>
  );
}
