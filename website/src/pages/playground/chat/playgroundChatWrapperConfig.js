import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import React from 'react';

export default function PlaygroundChatWrapperConfig({setEditingChatRef, cloneComponent, removeComponent, wrapperRef}) {
  return (
    <div className="playground-chat-config-buttons">
      <img className="playground-chat-drag-handle" src="img/drag-handle.svg"></img>
      <TooltipWrapper text="Configure">
        <img
          src="img/configure-2.svg"
          className="playground-chat-config-button playground-button"
          onClick={() => setEditingChatRef(wrapperRef)}
        ></img>
        {/* <Cog className="playground-chat-config-button" onClick={() => setEditingChatRef(ref)} /> */}
      </TooltipWrapper>
      <TooltipWrapper text="Clear messages">
        <img
          src="img/clear-messages.svg"
          className="playground-chat-config-button playground-chat-clear-button playground-button"
        ></img>
      </TooltipWrapper>
      <TooltipWrapper text="Clone">
        <img
          src="img/clone.svg"
          className="playground-chat-config-button playground-chat-clone-button playground-button"
          onClick={() => cloneComponent(wrapperRef)}
        ></img>
      </TooltipWrapper>
      <TooltipWrapper text="Remove">
        <img
          src="img/bin.svg"
          className="playground-chat-config-button playground-chat-remove-button playground-button"
          onClick={() => removeComponent(wrapperRef)}
        ></img>
      </TooltipWrapper>
    </div>
  );
}
