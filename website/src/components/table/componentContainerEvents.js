import ComponentContainer, {extractChildChatElement} from '@site/src/components/table/componentContainer';
import LiveData from './liveData';
import React from 'react';

// using child to prevent component re-render
const EventText = React.forwardRef(({propertyName}, ref) => {
  const [eventsText, setEventsText] = React.useState([propertyName === 'onComponentRender' ? 'finished rendering' : '']);
  React.useImperativeHandle(ref, () => {
    const closureEventsText = [];
    return {
      updateText: (argument) => {
        if (!ref.current) return;
        if (closureEventsText.length > 3) closureEventsText.pop();
        closureEventsText.unshift(JSON.parse(JSON.stringify(argument)));
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

export default function ComponentContainerEvents({children, propertyName}) {
  const containerRef = React.useRef(null);
  const eventTextRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        const syncReference = containerRef.current;
        if (containerRef.current && eventTextRef.current) {
          const deepChatReference = extractChildChatElement(containerRef.current.children[0]);
          deepChatReference[propertyName] = eventTextRef.current?.updateText;
        } else {
          const deepChatReference = extractChildChatElement(syncReference.children[0]);
          deepChatReference[propertyName] = () => {};
        }
      }
    }, 200); // in a timeout as containerRef.current not always set on start
  }, []);

  return (
    <div>
      <div ref={containerRef}>
        <ComponentContainer>{children}</ComponentContainer>
      </div>
      <div className="documentation-example-container method-example-container">
        <EventText propertyName={propertyName} ref={eventTextRef}></EventText>
      </div>
    </div>
  );
}
