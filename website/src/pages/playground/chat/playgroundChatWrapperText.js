import './playgroundChatWrapperText.css';
import React from 'react';

// When description is dirty do not reset
const ChatWrapperText = React.forwardRef(({textValue, setTextValue}, ref) => {
  React.useImperativeHandle(ref, () => ({
    getDirty() {
      return isDirty;
    },
  }));

  // prevent multiple spaces between words as they are not reflected in the div
  function onKeyDown(e) {
    const input = e.target;
    const value = input.value;
    const end = input.selectionEnd;
    if (e.keyCode == 32 && (value[end - 1] == ' ' || value[end] == ' ')) {
      e.preventDefault();
    }
  }

  function onChange(e) {
    setTextValue(e.target.value);
    setIsDirty(true);
  }

  const [isDirty, setIsDirty] = React.useState(false);

  // Because contentEditable has issues with max length and input cannot wrap its width around text - this is a workaround where
  // the text will be generated behind the back of the input to control the width and the user will interact with the input
  return (
    <div className="playground-chat-description-text playground-chat-description-text-parent">
      <input
        className="playground-chat-description-text playground-chat-description-text-input"
        value={textValue}
        maxLength={30}
        spellCheck="false"
        onChange={onChange}
        onKeyDown={onKeyDown}
      ></input>
      {textValue}
    </div>
  );
});

export default ChatWrapperText;
