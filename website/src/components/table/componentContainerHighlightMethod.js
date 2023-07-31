import ComponentContainer, {extractChildChatElement} from '@site/src/components/table/componentContainer';
import {removeHighlight, importHighlightAsync} from '@site/src/components/externalModules/externalModules';
import React from 'react';

function click(table) {
  const deepChatReference = extractChildChatElement(table);
  importHighlightAsync().then(() => {
    deepChatReference.refreshMessages();
  });
}

export default function ComponentContainerHighlightMethod({children}) {
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    removeHighlight();
  }, []);
  return (
    <div>
      <div ref={containerRef}>
        <ComponentContainer>{children}</ComponentContainer>
      </div>
      <div className="documentation-example-container method-example-container">
        <button className="documentation-button" onClick={() => click(containerRef.current.children[0])}>
          Call Method
        </button>
      </div>
    </div>
  );
}
