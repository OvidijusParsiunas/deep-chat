import React from 'react';

export default function ContainersKeyToggle({children}) {
  const [displayFirst, setDisplayFirst] = React.useState(true);
  return (
    <div>
      {displayFirst && children[0]}
      {!displayFirst && children[1]}
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
