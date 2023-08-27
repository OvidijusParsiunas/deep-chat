import './playgroundChatWrapper.css';
import React from 'react';

// The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children
const ChatWrapper = React.forwardRef(
  ({config, removeComponent, cloneComponent, setEditingChatRef, moveComponent, children, isAtEnd}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
      },
      fadeOut() {
        setScaleExpanded(false);
      },
      remove() {
        setWidthExpanded(false);
      },
      config,
    }));
    const [scaleExpanded, setScaleExpanded] = React.useState(false);
    const [widthExpanded, setWidthExpanded] = React.useState(isAtEnd);
    const [counter, setCounter] = React.useState(0); // this is used to re-render the component

    React.useEffect(() => {
      setTimeout(() => {
        if (isAtEnd) {
          setScaleExpanded(true);
        } else {
          setWidthExpanded(true);
          setTimeout(() => {
            setScaleExpanded(true);
          }, 200);
        }
      }); // in a timeout as otherwise if add button is spammed the animations will not show
    }, []);

    return (
      <div
        key={counter}
        className={`playground-chat-wrapper ${
          scaleExpanded ? 'playground-chat-wrapper-scale-expanded' : 'playground-chat-wrapper-scale-shrunk'
        } ${widthExpanded ? 'playground-chat-wrapper-width-expanded' : 'playground-chat-wrapper-width-shrunk'}`}
      >
        {/* The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children */}
        {children}
        <div>
          {/* The button is going to turn into the active logo */}
          <button onClick={() => setEditingChatRef(ref)}>Configure</button>
          <button onClick={() => removeComponent(ref)}>Remove</button>
          <button onClick={() => cloneComponent(ref)}>Clone</button>
          <button onClick={() => moveComponent(ref, false)}>Move Left</button>
          <button onClick={() => moveComponent(ref, true)}>Move Right</button>
        </div>
        {/* Option description for chat at bottom or at top */}
      </div>
    );
  }
);

export default ChatWrapper;
