import ActiveTableBrowser from '../../../components/table/activeTableBrowser';
import './columnTypes.css';
import React from 'react';

function RightPanel() {
  return (
    <div id="column-types-right">
      <div id="column-types-right-table">
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

function LeftPanel() {
  return (
    <div id="column-types-left">
      <div className="feature-text">
        Active table offers a variety of <b>column types</b> and an extensive API to create custom ones with custom
        sorting, validation, selection options and more.
      </div>
    </div>
  );
}

export default function ColumnTypes() {
  return (
    <div id="column-types">
      <LeftPanel></LeftPanel>
      <RightPanel></RightPanel>
    </div>
  );
}
