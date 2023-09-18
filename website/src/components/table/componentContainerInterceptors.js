import ComponentContainer, {extractChildChatElement} from '@site/src/components/table/componentContainer';
import LiveData from './liveData';
import React from 'react';

// using child to prevent component re-render
const EventText = React.forwardRef(({displayConsole}, ref) => {
  const [eventsText, setEventsText] = React.useState(['']);
  React.useImperativeHandle(ref, () => {
    const closureEventsText = [];
    return {
      updateText: (text, files) => {
        if (!ref.current) return;
        if (closureEventsText.length > 3) closureEventsText.pop();
        if (text) closureEventsText.unshift(JSON.parse(JSON.stringify(text)));
        if (files) {
          files.forEach((file) => {
            closureEventsText.unshift({name: file.name});
          });
        }
        setEventsText([...closureEventsText]);
        return text || files;
      },
    };
  });
  return displayConsole ? (
    <div>
      Console:
      <LiveData data={eventsText}></LiveData>
    </div>
  ) : (
    <div></div>
  );
});

export default function ComponentContainerInterceptors({children, propertyName, displayConsole}) {
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
    }, 10); // in a timeout as containerRef.current not always set on start
  }, []);

  return (
    <div>
      <div ref={containerRef}>
        <ComponentContainer>{children}</ComponentContainer>
      </div>
      <div className="documentation-example-container method-example-container">
        <EventText ref={eventTextRef} displayConsole={displayConsole}></EventText>
      </div>
    </div>
  );
}
