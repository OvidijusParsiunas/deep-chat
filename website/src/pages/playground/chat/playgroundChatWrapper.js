import './playgroundChatWrapper.css';
import React from 'react';

// The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children
const ChatWrapper = React.forwardRef(
  ({children, config, removeComponent, cloneComponent, setEditingChatRef, moveComponent, startDrag, isAtEnd}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
      },
      scaleOut() {
        setScaleExpanded(false);
      },
      remove() {
        setWidthExpanded(false);
      },
      startDragging(marginLeft) {
        setPreventAnimation(true);
        setMarginLeft(marginLeft);
        setDragging(true);
      },
      releaseDragging(marginLeft) {
        setMarginLeft(marginLeft);
        setPreventAnimation(false);
      },
      concludeDragging() {
        setMarginLeft(0);
        setDragging(false);
      },
      tempNoAnimation(func, timeout = 200) {
        setPreventAnimation(true);
        func();
        setTimeout(() => {
          setPreventAnimation(false);
        }, timeout);
      },
      updateMarginLeft(marginLeft) {
        setMarginLeft(marginLeft);
      },
      updateMarginRight(marginRight) {
        setMarginRight(marginRight);
      },
      config,
    }));

    const [counter, setCounter] = React.useState(0); // this is used to re-render the component
    const [scaleExpanded, setScaleExpanded] = React.useState(false);
    const [widthExpanded, setWidthExpanded] = React.useState(isAtEnd);
    const [preventAnimation, setPreventAnimation] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [marginLeft, setMarginLeft] = React.useState(0);
    const [marginRight, setMarginRight] = React.useState(0);

    React.useEffect(() => {
      let isMounted = true;
      setTimeout(() => {
        if (!isMounted) return;
        if (isAtEnd) {
          setScaleExpanded(true);
        } else {
          setWidthExpanded(true);
          setTimeout(() => {
            setScaleExpanded(true);
          }, 200);
        }
      }); // in a timeout as otherwise if add button is spammed the animations will not show
      return () => {
        isMounted = false;
      };
    }, []);

    return (
      <div
        key={counter}
        style={{marginLeft, marginRight}}
        className={`playground-chat-wrapper ${
          scaleExpanded ? 'playground-chat-wrapper-scale-expanded' : 'playground-chat-wrapper-scale-shrunk'
        } ${widthExpanded ? 'playground-chat-wrapper-width-expanded' : 'playground-chat-wrapper-width-shrunk'}
        ${preventAnimation ? 'playground-chat-wrapper-no-animation' : ''} ${
          dragging ? 'playground-chat-wrapper-dragging' : ''
        }`}
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
          <button style={{cursor: dragging ? 'grabbing' : 'grab'}} onMouseDown={() => startDrag(ref)}>
            Move
          </button>
        </div>
        {/* Option description for chat at bottom or at top */}
      </div>
    );
  }
);

export default ChatWrapper;
