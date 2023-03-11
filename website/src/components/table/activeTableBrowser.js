import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

// Used to allow client side rendering
export default function ActiveTableBrowser(props) {
  return (
    <BrowserOnly>
      {() => {
        const ActiveTable = require('active-table-react').ActiveTable;
        return <ActiveTable {...props}></ActiveTable>;
      }}
    </BrowserOnly>
  );
}
