import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import './playgroundChatComponent.css';
import React from 'react';

const ChatComponent = React.forwardRef(
  ({config, removeComponent, cloneComponent, setEditingChatRef, moveComponent}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
      },
      fadeOut() {
        setExpanded(false);
      },
      remove() {
        setRemoved(true);
      },
      config,
    }));
    const [expanded, setExpanded] = React.useState(false);
    const [removed, setRemoved] = React.useState(false);
    const [counter, setCounter] = React.useState(0);
    const elementRef = React.useRef(null);

    React.useEffect(() => {
      setTimeout(() => {
        setExpanded(true);
      }); // in a timeout as otherwise if add button is spammed the animations will not show
    }, []);

    return (
      <div
        key={counter}
        ref={elementRef}
        className={`playground-component ${
          expanded ? 'playground-component-expanded' : 'playground-component-collapsed'
        } ${removed ? 'playground-component-removed' : 'playground-component-visible'}`}
      >
        <div style={{display: 'flex', justifyContent: 'center'}}>
          {config.custom ? (
            <DeepChatBrowser
              request={config.custom}
              containerStyle={{
                borderRadius: '10px',
                boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
                borderColor: '#ededed',
                marginLeft: '10px',
                marginRight: '10px',
                width: '20vw',
              }}
            ></DeepChatBrowser>
          ) : (
            <DeepChatBrowser
              directConnection={config}
              containerStyle={{
                borderRadius: '10px',
                boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
                borderColor: '#ededed',
                marginLeft: '10px',
                marginRight: '10px',
                width: '20vw',
              }}
            ></DeepChatBrowser>
          )}
        </div>
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

export default ChatComponent;
