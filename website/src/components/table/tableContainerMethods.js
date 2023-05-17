import ComponentContainer, {extractChildTableElement} from '@site/src/components/table/componentContainer';
import LiveTableData from './liveTableData';
import React from 'react';

// using child to prevent table re-render
const ResultText = React.forwardRef((_, ref) => {
  const [resultsText, setResultsText] = React.useState(['']);
  React.useImperativeHandle(ref, () => {
    const closureResultsText = [];
    return {
      updateText: (argument) => {
        if (closureResultsText.length > 3) closureResultsText.pop();
        closureResultsText.unshift(argument);
        setResultsText([...closureResultsText]);
      },
    };
  });
  return (
    <div>
      Method results:
      <LiveTableData data={resultsText}></LiveTableData>
    </div>
  );
});

export default function TableContainerMethods({children, propertyname, displayResults}) {
  const tableContainerRef = React.useRef(null);
  const eventTextRef = React.useRef(null);
  const updateText = eventTextRef.current?.updateText; // stored in a reference for closure to work

  const click = () => {
    const activeTableReference = extractChildTableElement(tableContainerRef.current.children[0]);
    const content = activeTableReference[propertyname]();
    if (displayResults ?? true) updateText(content);
  };

  return (
    <div>
      <div ref={tableContainerRef}>
        <ComponentContainer>{children}</ComponentContainer>
      </div>
      <div className="documentation-example-container">
        <button className="documentation-method-button" onClick={click}>
          Call Method
        </button>
        {(displayResults ?? true) && <ResultText ref={eventTextRef}></ResultText>}
      </div>
    </div>
  );
}
