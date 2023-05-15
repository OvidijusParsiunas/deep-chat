import ProgrammaticUpdates from './programmaticUpdates/programmaticUpdates';
import ResponsiveDesign from './responsiveDesign/responsiveDesign';
import LayoutManagement from './layoutManagement/layoutManagement';
import Customization from './customization/customization';
import ColumnTypes from './columnTypes/columnTypes';
import React from 'react';
import './features.css';

// In the future - move this section to examples and replace it with reviews-statistics-comments etc.
export default function Features() {
  return (
    <div id="features-container">
      <div id="features-header" className="header-font">
        Main Features
      </div>
      <ColumnTypes></ColumnTypes>
      <ProgrammaticUpdates></ProgrammaticUpdates>
      <ResponsiveDesign></ResponsiveDesign>
      <LayoutManagement></LayoutManagement>
      <Customization></Customization>
    </div>
  );
}
