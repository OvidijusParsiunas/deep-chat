import './playgroundChatWrapper.css';
import React from 'react';

// The wrapper is used to manipulate the css without re-rendering the actual chat component by storing it inside children
const ChatWrapper = React.forwardRef(
  ({children, config, removeComponent, cloneComponent, setEditingChatRef, moveComponent, isAtEnd}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
      },
      scaleOut() {
        setScaleExpanded(false); // shrunk already has animation
      },
      remove() {
        setWidthExpanded(false);
      },
      getOffsetTop() {
        return elementRef.current.offsetTop;
      },
      startDragging(marginLeft, marginTop) {
        setPreventAnimation(true);
        setMarginLeft(marginLeft);
        setMarginTop(marginTop);
        setDragging(true);
      },
      releaseDragging(marginLeft, marginTop) {
        setMarginLeft(marginLeft);
        setMarginTop(marginTop);
        setPreventAnimation(false);
      },
      concludeDragging() {
        setMarginLeft(0);
        setMarginTop(0);
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
      updateMarginTop(marginTop) {
        setMarginTop(marginTop);
      },
      config,
    }));

    const elementRef = React.createRef(null);
    const [counter, setCounter] = React.useState(0); // this is used to re-render the component
    const [scaleExpanded, setScaleExpanded] = React.useState(false);
    const [widthExpanded, setWidthExpanded] = React.useState(isAtEnd);
    const [preventAnimation, setPreventAnimation] = React.useState(false);
    const [allowAnimation, setAllowAnimation] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [marginLeft, setMarginLeft] = React.useState(0);
    const [marginRight, setMarginRight] = React.useState(0);
    const [marginTop, setMarginTop] = React.useState(0);

    React.useEffect(() => {
      let isMounted = true;
      setTimeout(() => {
        if (!isMounted) return;
        setAllowAnimation(true);
        if (isAtEnd) {
          setScaleExpanded(true);
          setTimeout(() => {
            setAllowAnimation(false);
          }, 500);
        } else {
          setWidthExpanded(true);
          setTimeout(() => {
            setScaleExpanded(true);
            setTimeout(() => {
              setAllowAnimation(false);
            }, 500);
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
        ref={elementRef}
        style={{marginLeft, marginRight, marginTop}}
        className={`playground-chat-wrapper ${allowAnimation ? 'playground-chat-animated' : ''} ${
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
          <button id="playground-chat-drag-handle">Move</button>
        </div>
        {/* Option description for chat at bottom or at top */}
      </div>
    );
  }
);

export default ChatWrapper;
