import ActiveTableBrowser from '../../../components/table/activeTableBrowser';
import './layoutManagement.css';
import React from 'react';

function Panel({children}) {
  return (
    <div className="layout-management-panel">
      <div className="layout-management-table">{children}</div>
    </div>
  );
}

function RightPanel() {
  return (
    <Panel>
      <ActiveTableBrowser
        tableStyle={{borderRadius: '5px', width: '100%'}}
        pagination={{rowsPerPage: 4}}
        content={[
          ['Planet', 'Diameter', 'Mass', 'Moons'],
          ['Earth', 12756, 5.97, 1],
          ['Mars', 6792, 0.642, 2],
          ['Jupiter', 142984, 1898, 79],
          ['Saturn', 120536, 568, 82],
          ['Neptune', 49528, 102, 14],
          ['Mercury', 4879, 0.33, 0],
          ['Venus', 12104, 4.87, 0],
          ['Uranus', 51118, 86.8, 27],
          ['Pluto', 2376, 0.013, 5],
          ['Moon', 3475, 0.073, 0],
          ['Earth', 12756, 5.97, 1],
          ['Mars', 6792, 0.642, 2],
        ]}
      ></ActiveTableBrowser>
    </Panel>
  );
}

function LeftPanel() {
  // There is a bug where Safari displays a horizontal scroll, hence adding need to set the height property as well
  return (
    <Panel>
      <ActiveTableBrowser
        tableStyle={{borderRadius: '5px', width: '100%'}}
        overflow={{maxHeight: '256px', maxWidth: '100%'}}
        auxiliaryStyle="
        ::-webkit-scrollbar {
          width: 9px;
          height: 9px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #aaaaaa;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-track {
          background-color: #f2f2f2;
        }"
        content={[
          ['Planet', 'Diameter', 'Mass', 'Moons'],
          ['Earth', 12756, 5.97, 1],
          ['Mars', 6792, 0.642, 2],
          ['Jupiter', 142984, 1898, 79],
          ['Saturn', 120536, 568, 82],
          ['Neptune', 49528, 102, 14],
          ['Mercury', 4879, 0.33, 0],
          ['Venus', 12104, 4.87, 0],
          ['Uranus', 51118, 86.8, 27],
          ['Pluto', 2376, 0.013, 5],
          ['Moon', 3475, 0.073, 0],
        ]}
      ></ActiveTableBrowser>
    </Panel>
  );
}

export default function LayoutManagement() {
  return (
    <div id="layout-management">
      <div className="feature-sub-header">Layout management</div>
      <div id="layout-management-content">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
