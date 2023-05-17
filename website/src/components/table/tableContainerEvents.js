import ComponentContainer, {extractChildTableElement} from '@site/src/components/table/componentContainer';
import LiveTableData from './liveTableData';
import React from 'react';

// using child to prevent table re-render
const EventText = React.forwardRef((_, ref) => {
  const [eventsText, setEventsText] = React.useState(['']);
  React.useImperativeHandle(ref, () => {
    const closureEventsText = [];
    return {
      updateText: (argument) => {
        if (!ref.current) return;
        if (closureEventsText.length > 3) closureEventsText.pop();
        closureEventsText.unshift(argument);
        setEventsText([...closureEventsText]);
      },
    };
  });
  return (
    <div>
      Latest events:
      <LiveTableData data={eventsText}></LiveTableData>
    </div>
  );
});

export default function TableContainerEvents({children, propertyname}) {
  const tableContainerRef = React.useRef(null);
  const eventTextRef = React.useRef(null);

  if (tableContainerRef.current) {
    const syncReference = tableContainerRef.current;
    setTimeout(() => {
      if (tableContainerRef.current && eventTextRef.current) {
        const activeTableReference = extractChildTableElement(tableContainerRef.current.children[0]);
        activeTableReference[propertyname] = eventTextRef.current?.updateText;
      } else {
        const activeTableReference = extractChildTableElement(syncReference.children[0]);
        activeTableReference[propertyname] = () => {};
      }
    });
  }

  return (
    <div>
      <div ref={tableContainerRef}>
        <ComponentContainer>{children}</ComponentContainer>
      </div>
      <div className="documentation-example-container">
        <EventText ref={eventTextRef}></EventText>
      </div>
    </div>
  );
}
