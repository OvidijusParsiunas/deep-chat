import ComponentContainer, {extractChildChatElement} from '@site/src/components/table/componentContainer';
import LiveData from './liveData';
import React from 'react';

function ResultText(props) {
  return (
    <div>
      Method results:
      <LiveData data={props.resultText}></LiveData>
    </div>
  );
}

function click(table, resultText, setResultText, propertyName, displayResults, args, onClick) {
  const deepChatReference = extractChildChatElement(table);
  onClick?.(deepChatReference);
  if (!deepChatReference[propertyName]) return;
  const content = deepChatReference[propertyName](...(args || []));
  if (displayResults ?? true) {
    let newResultTextArr = [...resultText];
    if (newResultTextArr.length === 1 && newResultTextArr[0] === '') newResultTextArr = [];
    if (newResultTextArr.length > 3) newResultTextArr.pop();
    newResultTextArr.unshift(JSON.parse(JSON.stringify(content)));
    setResultText(newResultTextArr);
  }
}

export default function ComponentContainerMethods({children, propertyName, displayResults, args, withEvent, onClick}) {
  const containerRef = React.useRef(null);
  const [resultText, setResultText] = React.useState(['']);

  return (
    <div>
      <div ref={containerRef}>
        <ComponentContainer>{children}</ComponentContainer>
      </div>
      <div
        className="documentation-example-container method-example-container"
        style={{paddingBottom: withEvent ? 0 : ''}}
      >
        <button
          className="documentation-button documentation-button-middle"
          onClick={() =>
            click(containerRef.current.children[0], resultText, setResultText, propertyName, displayResults, args, onClick)
          }
        >
          Call Method
        </button>
        {(displayResults ?? true) && <ResultText resultText={resultText} />}
      </div>
    </div>
  );
}
