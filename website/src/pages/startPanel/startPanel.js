import ActiveTableBrowser from '../../components/table/activeTableBrowser';
import React from 'react';
import './startPanel.css';

function RightPanel() {
  return (
    <div id="start-panel-right">
      <div id="start-panel-right-table">
        <ActiveTableBrowser
          tableStyle={{borderRadius: '5px', width: '100%'}}
          customColumnTypes={[
            {
              name: 'Category',
              iconSettings: {
                reusableIconName: 'label',
              },
              label: {
                // options: [
                //   {text: 'Vehicles', backgroundColor: '#d9ebfc'},
                //   {text: 'Electronics', backgroundColor: '#ccffe2'},
                //   {text: 'Furniture', backgroundColor: '#f7e0ab'},
                //   {text: 'Food', backgroundColor: '#e1ff8f'},
                //   {text: 'Jewellery', backgroundColor: '#ffcce1'},
                //   {text: 'Clothing', backgroundColor: '#cdf3fe'},
                //   {text: 'Clothing', backgroundColor: '#f1fecd'},
                // ],
                // options: [
                //   {text: 'Vehicles', backgroundColor: '#d6cdfe'},
                //   {text: 'Electronics', backgroundColor: '#fcf5b0'},
                //   {text: 'Furniture', backgroundColor: '#eec191'},
                //   {text: 'Food', backgroundColor: '#b9e694'},
                //   {text: 'Jewellery', backgroundColor: '#f7e0ab'},
                //   {text: 'Clothing', backgroundColor: '#afdffd'},
                // ],
                // options: [
                //   {text: 'Vehicles', backgroundColor: '#d3ecff'},
                //   {text: 'Electronics', backgroundColor: '#fcf5b0'},
                //   {text: 'Furniture', backgroundColor: '#e9ccff'},
                //   {text: 'Food', backgroundColor: '#b9e694'},
                //   {text: 'Jewellery', backgroundColor: '#ffe2c8'},
                //   {text: 'Clothing', backgroundColor: '#afdffd'},
                // ],
                // options: [
                //   {text: 'Vehicles', backgroundColor: '#f1fecd'},
                //   {text: 'Electronics', backgroundColor: '#e1ff8f'},
                //   {text: 'Furniture', backgroundColor: '#cdfef7'},
                //   {text: 'Food', backgroundColor: '#ccffe2'},
                //   {text: 'Jewellery', backgroundColor: '#b9e694'},
                //   {text: 'Clothing', backgroundColor: '#ffe0f9'},
                //   // {text: 'Clothing', backgroundColor: '#f8e6b2'},
                // ],
                options: [
                  {text: 'Vehicles', backgroundColor: '#fff5a3'},
                  {text: 'Electronics', backgroundColor: '#ccffe2'},
                  {text: 'Furniture', backgroundColor: '#e1ff8f'},
                  {text: 'Food', backgroundColor: '#d2eeff'},
                  {text: 'Jewellery', backgroundColor: '#c4f39e'},
                  {text: 'Clothing', backgroundColor: '#ffdff7'},
                ],
              },
            },
          ]}
          customColumnsSettings={[
            {
              headerName: 'Category',
              defaultColumnTypeName: 'Category',
            },
            {headerName: 'Sale date', defaultColumnTypeName: 'Date d-m-y'},
            {headerName: 'Price', defaultColumnTypeName: 'Currency'},
          ]}
          content={[
            ['Name', 'Category', 'Sale date', 'Price'],
            ['Car', 'Vehicles', '20/07/2012', '$6800.00'],
            ['Laptop', 'Electronics', '08/11/2014', '$700'],
            ['Chair', 'Furniture', '05/02/2019', '$20.00'],
            ['Apples', 'Food', '10/04/2022', '$1.00'],
            ['Bracelet', 'Jewellery', '10/06/1998', '$180.00'],
            ['Jeans', 'Clothing', '16/02/2023', '$70.00'],
          ]}
        ></ActiveTableBrowser>
      </div>
    </div>
  );
}

export function LeftPanel() {
  return (
    <div id="start-panel-left">
      <h1 id="start-colored-header" className="header-font">
        Active Table
      </h1>
      <h1 id="start-sub-header">Framework agnostic table component for editable data experience</h1>
      <div id="start-buttons">
        <a className="homepage-button start-button" href="docs/installation">
          Installation
        </a>
        <a className="homepage-button start-button" href="docs/table">
          Explore API
        </a>
      </div>
    </div>
  );
}

export default function StartPanel() {
  return (
    <div id="start-panel">
      <div id="start-panel-content">
        <LeftPanel></LeftPanel>
        <RightPanel></RightPanel>
      </div>
    </div>
  );
}
