import ComponentContainer, {extractChildChatElement} from '@site/src/components/table/componentContainer';
import LiveData from './liveData';
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
      <LiveData data={eventsText}></LiveData>
    </div>
  );
});

export default function TableContainerEvents({children, propertyName}) {
  const tableContainerRef = React.useRef(null);
  const eventTextRef = React.useRef(null);

  if (tableContainerRef.current) {
    const syncReference = tableContainerRef.current;
    setTimeout(() => {
      if (tableContainerRef.current && eventTextRef.current) {
        const activeTableReference = extractChildChatElement(tableContainerRef.current.children[0]);
        activeTableReference[propertyName] = eventTextRef.current?.updateText;
      } else {
        const activeTableReference = extractChildChatElement(syncReference.children[0]);
        activeTableReference[propertyName] = () => {};
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
