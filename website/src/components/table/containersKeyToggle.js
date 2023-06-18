import ComponentContainer from '@site/src/components/table/componentContainer';
import React from 'react';

export default function ContainersKeyToggle({children}) {
  const [displayFirst, setDisplayFirst] = React.useState(true);
  return (
    <div>
      {displayFirst && <ComponentContainer>{children[0]}</ComponentContainer>}
      {!displayFirst && <ComponentContainer>{children[1]}</ComponentContainer>}
      <div className="component-key-toggle-button-container">
        <button
          className={'documentation-button component-key-toggle-button'}
          onClick={() => setDisplayFirst(!displayFirst)}
        >
          {displayFirst && 'Insert test key'}
          {!displayFirst && 'Use placeholder key'}
        </button>
      </div>
    </div>
  );
}
