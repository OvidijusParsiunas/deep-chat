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
};
const WIDTH = 400;
const HALF_WIDTH = 400 / 2;

const Move = React.forwardRef(({chatComponents, componentListRef, refreshList, latestChatIndex}, ref) => {
  React.useImperativeHandle(ref, () => ({
    startDrag(componentToBeMoved) {
      clearTimeout(mouseMove.timeout);
      const index = chatComponents.findIndex((component) => component.ref === componentToBeMoved);
      mouseMove.chat = componentToBeMoved;
      mouseMove.initialMarginLeft = index * WIDTH;
      mouseMove.newMarginLeft = mouseMove.initialMarginLeft;
      chatComponents[index].ref.current.startDragging(mouseMove.initialMarginLeft);
      mouseMove.previousChat = chatComponents[index - 1]?.ref.current;
      mouseMove.nextChat = chatComponents[index + 1]?.ref.current;
      if (mouseMove.nextChat) {
        mouseMove.nextChat.tempNoAnimation(mouseMove.nextChat.updateMarginLeft.bind(this, WIDTH), 0);
      } else if (mouseMove.previousChat) {
        mouseMove.previousChat.updateMarginRight(WIDTH);
      }
      mouseMove.newIndex = index;
      mouseMove.initialIndex = index;
      mouseMove.lastScrollLeft = componentListRef.current.scrollLeft;
    },
  }));

  function moveChat(newMovement) {
    if (mouseMove.chat) {
      mouseMove.newMarginLeft += newMovement;
      if (
        (mouseMove.newIndex + 1 === chatComponents.length && mouseMove.newMarginLeft > mouseMove.initialMarginLeft) ||
        mouseMove.newMarginLeft < 0
      ) {
        return;
      }
      mouseMove.chat.current.updateMarginLeft(mouseMove.newMarginLeft);
      if (mouseMove.newMarginLeft > mouseMove.initialMarginLeft + HALF_WIDTH) {
        mouseMove.nextChat?.updateMarginLeft(0);
        mouseMove.previousChat = mouseMove.nextChat;
        const indexIncrement =
          mouseMove.newIndex >= mouseMove.initialIndex || mouseMove.newIndex + 1 === mouseMove.initialIndex ? 2 : 1;
        mouseMove.nextChat = chatComponents[mouseMove.newIndex + indexIncrement]?.ref.current;
        if (mouseMove.nextChat) {
          mouseMove.nextChat.updateMarginLeft(WIDTH);
        } else {
          mouseMove.previousChat?.updateMarginRight(WIDTH);
        }
        mouseMove.initialMarginLeft += WIDTH;
        mouseMove.newIndex += 1;
      } else if (mouseMove.newMarginLeft > 0 && mouseMove.newMarginLeft < mouseMove.initialMarginLeft - 200) {
        if (mouseMove.nextChat) {
          mouseMove.nextChat?.updateMarginLeft(0);
        } else {
          mouseMove.previousChat?.updateMarginRight(0);
        }
        mouseMove.nextChat = mouseMove.previousChat;
        const decrementIncrement =
          mouseMove.newIndex <= mouseMove.initialIndex || mouseMove.newIndex - 1 === mouseMove.initialIndex ? 2 : 1;
        mouseMove.previousChat = chatComponents[mouseMove.newIndex - decrementIncrement]?.ref.current;
        mouseMove.nextChat.updateMarginLeft(WIDTH);
        mouseMove.initialMarginLeft -= WIDTH;
        mouseMove.newIndex -= 1;
      }
    }
  }

  function stopDrag() {
    if (mouseMove.chat) {
      const index = chatComponents.findIndex((component) => component.ref === mouseMove.chat);
      mouseMove.chat.current.releaseDragging(mouseMove.initialMarginLeft);
      const element = mouseMove.chat;
      mouseMove.chat = null;
      mouseMove.timeout = setTimeout(() => {
        if (!element.current) return; // will be null when changing page when dragging
        element.current.tempNoAnimation(element.current.concludeDragging);
        mouseMove.nextChat?.tempNoAnimation(mouseMove.nextChat?.updateMarginLeft.bind(this, 0));
        mouseMove.previousChat?.tempNoAnimation(mouseMove.previousChat?.updateMarginRight.bind(this, 0));
        if (mouseMove.newIndex !== index) {
          const element1 = chatComponents[index];
          chatComponents.splice(index, 1);
          chatComponents.splice(mouseMove.newIndex - 1, 0, element1);
          refreshList((latestChatIndex.index += 1));
        }
      }, 300);
    }
  }

  function mouseMoveFunc(event) {
    moveChat(event.movementX);
  }

  function scroll(event) {
    if (mouseMove.chat) {
      moveChat(event.target.scrollLeft - mouseMove.lastScrollLeft);
      mouseMove.lastScrollLeft = event.target.scrollLeft;
    }
  }

  React.useEffect(() => {
    window.addEventListener('mousemove', mouseMoveFunc);
    window.addEventListener('mouseup', stopDrag);
    componentListRef.current.addEventListener('scroll', scroll);
    return () => {
      window.removeEventListener('mousemove', mouseMoveFunc);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, []);

  return <div ref={ref}></div>;
});

export default Move;
