import React from 'react';

// state kept here as the chat components are not re-rendered when something happens in other components, hence
// they would not have a reference to the latest state
const mouseMove = {
  chat: null,
  previousChat: null,
  nextChat: null,
  initialIndex: 0,
  newIndex: 0,
  initialMarginLeft: 0,
  newMarginLeft: 0,
  lastScrollLeft: 0,
  concludeFunc: null,
  concludeFuncTimeout: null,
  earlyTrackMouseMovement: false, // used for case where dragging started before another chat drag is waiting to conclude
};
const WIDTH = 400;
const HALF_WIDTH = 400 / 2;

const Move = React.forwardRef(({chatComponents, componentListRef, refreshList, latestChatIndex}, ref) => {
  React.useImperativeHandle(ref, () => ({
    startDrag(chatToBeMoved) {
      // if waiting to conclude dragging another chat
      if (mouseMove.concludeFunc) {
        clearTimeout(mouseMove.concludeFuncTimeout);
        mouseMove.concludeFunc();
        prePrepareForDrag(chatToBeMoved);
        setTimeout(() => prepareForDrag(chatToBeMoved), 300); // wait for other animation to finish
      } else {
        prePrepareForDrag(chatToBeMoved);
        prepareForDrag(chatToBeMoved);
      }
    },
  }));

  // need for pre is used for case where dragging started before another chat drag is waiting to conclude
  // hence it allows to move the new chat component to the new mouse position when ready
  function prePrepareForDrag(chatToBeMoved) {
    const index = chatComponents.findIndex((component) => component.ref === chatToBeMoved);
    mouseMove.newIndex = index;
    mouseMove.initialIndex = index;
    mouseMove.initialMarginLeft = index * WIDTH;
    mouseMove.newMarginLeft = mouseMove.initialMarginLeft;
    mouseMove.earlyTrackMouseMovement = true;
    mouseMove.lastScrollLeft = componentListRef.current.scrollLeft;
  }

  function prepareForDrag(chatToBeMoved) {
    mouseMove.chat = chatToBeMoved;
    mouseMove.chat.current.startDragging(mouseMove.initialMarginLeft);
    mouseMove.previousChat = chatComponents[mouseMove.newIndex - 1]?.ref.current;
    mouseMove.nextChat = chatComponents[mouseMove.newIndex + 1]?.ref.current;
    if (mouseMove.nextChat) {
      mouseMove.nextChat.tempNoAnimation(mouseMove.nextChat.updateMarginLeft.bind(this, WIDTH), 0);
    } else if (mouseMove.previousChat) {
      mouseMove.previousChat.updateMarginRight(WIDTH);
    }
  }

  function isOutOfBounds() {
    return (
      (mouseMove.newIndex + 1 === chatComponents.length && mouseMove.newMarginLeft > mouseMove.initialMarginLeft) ||
      mouseMove.newMarginLeft < 0
    );
  }

  function toggleSideChatMargin(width) {
    if (mouseMove.nextChat) {
      mouseMove.nextChat.updateMarginLeft(width);
    } else {
      mouseMove.previousChat?.updateMarginRight(width);
    }
  }

  function dragChat() {
    if (isOutOfBounds()) return;
    mouseMove.chat.current.updateMarginLeft(mouseMove.newMarginLeft);
    // right
    if (mouseMove.newMarginLeft > mouseMove.initialMarginLeft + HALF_WIDTH) {
      mouseMove.nextChat?.updateMarginLeft(0);
      mouseMove.previousChat = mouseMove.nextChat;
      // initial index affects what the next index should be
      const newNextIndex =
        mouseMove.newIndex >= mouseMove.initialIndex || mouseMove.newIndex + 1 === mouseMove.initialIndex ? 2 : 1;
      mouseMove.nextChat = chatComponents[mouseMove.newIndex + newNextIndex]?.ref.current;
      toggleSideChatMargin(WIDTH);
      mouseMove.initialMarginLeft += WIDTH;
      mouseMove.newIndex += 1;
      // left
    } else if (mouseMove.newMarginLeft > 0 && mouseMove.newMarginLeft < mouseMove.initialMarginLeft - HALF_WIDTH) {
      toggleSideChatMargin(0);
      mouseMove.nextChat = mouseMove.previousChat;
      // initial index affects what the previous index should be
      const newPreviousIndex =
        mouseMove.newIndex <= mouseMove.initialIndex || mouseMove.newIndex - 1 === mouseMove.initialIndex ? 2 : 1;
      mouseMove.previousChat = chatComponents[mouseMove.newIndex - newPreviousIndex]?.ref.current;
      mouseMove.nextChat.updateMarginLeft(WIDTH);
      mouseMove.initialMarginLeft -= WIDTH;
      mouseMove.newIndex -= 1;
    }
  }

  function concludeDragging(chatRef) {
    mouseMove.concludeFuncTimeout = null;
    mouseMove.concludeFunc = null;
    if (!chatRef.current) return; // will be null when changing page when dragging
    chatRef.current.tempNoAnimation(chatRef.current.concludeDragging);
    mouseMove.nextChat?.tempNoAnimation(mouseMove.nextChat?.updateMarginLeft.bind(this, 0));
    mouseMove.previousChat?.tempNoAnimation(mouseMove.previousChat?.updateMarginRight.bind(this, 0));
    if (mouseMove.newIndex !== mouseMove.initialIndex) {
      const chatComponent = chatComponents[mouseMove.initialIndex];
      chatComponents.splice(mouseMove.initialIndex, 1);
      chatComponents.splice(mouseMove.newIndex, 0, chatComponent);
      refreshList((latestChatIndex.index += 1));
    }
  }

  function stopDrag() {
    if (mouseMove.chat) {
      mouseMove.chat.current.releaseDragging(mouseMove.initialMarginLeft);
      mouseMove.concludeFunc = concludeDragging.bind(this, mouseMove.chat);
      mouseMove.chat = null;
      mouseMove.earlyTrackMouseMovement = false;
      mouseMove.concludeFuncTimeout = setTimeout(() => {
        mouseMove.concludeFunc();
        // needs to be at least animation length or else chat components will move after drag
        // you can test this by having 3 chats and moving middle one to left or right
      }, 500);
    }
  }

  function onMouseMove(event) {
    if (mouseMove.earlyTrackMouseMovement) {
      mouseMove.newMarginLeft += event.movementX;
      if (mouseMove.chat) dragChat();
    }
  }

  // when dragging and there is overflow, the list can autoscroll with cursor - hence this is used to make sure chat is at correct position
  function onListElementScroll(event) {
    if (mouseMove.earlyTrackMouseMovement) {
      mouseMove.newMarginLeft += event.target.scrollLeft - mouseMove.lastScrollLeft;
      if (mouseMove.chat) dragChat();
      mouseMove.lastScrollLeft = event.target.scrollLeft;
    }
  }

  React.useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDrag);
    componentListRef.current.addEventListener('scroll', onListElementScroll);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, []);

  return <div ref={ref}></div>;
});

export default Move;
