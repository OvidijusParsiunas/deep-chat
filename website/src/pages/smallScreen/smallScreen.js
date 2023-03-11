import ActiveTableBrowser from '../../components/table/activeTableBrowser';
import {LeftPanel} from '../startPanel/startPanel';
import FadeInContent from '../utils/fadeInContent';
import './smallScreen.css';
import React from 'react';

export default function SmallScreen() {
  const contentRef = React.useRef(null);
  return (
    <div ref={contentRef} id="small-screen">
      <FadeInContent contentRef={contentRef}></FadeInContent>
      <LeftPanel></LeftPanel>
      <div id="small-screen-table">
        <ActiveTableBrowser
          tableStyle={{borderRadius: '5px', width: '100%'}}
          customColumnsSettings={[
            {
              headerName: 'Name',
              defaultColumnTypeName: 'Name',
              customColumnTypes: [
                {
                  name: 'Name',
                  label: {
                    options: [
                      {text: 'Peter', backgroundColor: '#cdfef7'},
                      {text: 'John', backgroundColor: '#d6ffbd'},
                      {text: 'Gregg', backgroundColor: '#fdd1e1'},
                      {text: 'Jeff', backgroundColor: '#fff2c2'},
                    ],
                  },
                },
              ],
            },
            {headerName: 'Date of Birth', defaultColumnTypeName: 'Date d-m-y'},
            {
              headerName: 'Hobby',
              defaultColumnTypeName: 'Hobbies',
              customColumnTypes: [
                {
                  name: 'Hobbies',
                  iconSettings: {reusableIconName: 'Select'},
                  select: {options: ['Fishing', 'Soccer', 'Reading']},
                },
              ],
            },
            {headerName: 'Verified', defaultColumnTypeName: 'Checkbox'},
          ]}
          displayIndexColumn={false}
          displayAddNewColumn={false}
          content={[
            ['Name', 'Date of Birth', 'Hobby', 'Verified'],
            ['Peter', '12-08-1992', 'Fishing', 'true'],
            ['John', '14-10-2012', 'Soccer', 'false'],
            ['Gregg', '05-02-1975', 'Reading', 'true'],
            ['Jeff', '24-04-2015', 'Soccer', 'false'],
          ]}
        ></ActiveTableBrowser>
      </div>
    </div>
  );
}
