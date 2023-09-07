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

function click(table, resultText, setResultText, propertyName, displayResults, argument) {
  const deepChatReference = extractChildChatElement(table);
  const content = deepChatReference[propertyName](argument);
  if (displayResults ?? true) {
    let newResultTextArr = [...resultText];
    if (newResultTextArr.length === 1 && newResultTextArr[0] === '') newResultTextArr = [];
    if (newResultTextArr.length > 3) newResultTextArr.pop();
    newResultTextArr.unshift(JSON.parse(JSON.stringify(content)));
    setResultText(newResultTextArr);
  }
}

export default function ComponentContainerMethods({children, propertyName, displayResults, argument, withEvent}) {
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
          className="documentation-button"
          onClick={() =>
            click(containerRef.current.children[0], resultText, setResultText, propertyName, displayResults, argument)
          }
        >
          Call Method
        </button>
        {(displayResults ?? true) && <ResultText resultText={resultText} />}
      </div>
    </div>
  );
}
