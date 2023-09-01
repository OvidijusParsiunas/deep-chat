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
  maxMarginLeft: 0,
  maxMarginTop: 0,
  initialMarginTop: 0,
  newMarginLeft: 0,
  newMarginTop: 0,
  lastScrollLeft: 0,
  lastScrollTop: 0,
  isWaitingToConcludeDrag: false,
  isWaitingToConcludeDrag2: false,
  earlyTrackMouseMovement: false, // used for case where dragging started before another chat drag is waiting to conclude
  isGridView: false,
};
const WIDTH = 400;
const HALF_WIDTH = 400 / 2;
const HEIGHT = 440;
const HALF_HEIGHT = HEIGHT / 2;
const ROW_LENGTH = 3;

const Move = React.forwardRef(({chatComponents, componentListRef, refreshList, latestChatIndex, isGridView}, ref) => {
  React.useImperativeHandle(ref, () => ({
    startDrag(chatToBeMoved) {
      if (mouseMove.isWaitingToConcludeDrag2) return;
      const componentIndex = prePrepareForDrag(chatToBeMoved);
      // if waiting to conclude dragging another chat - triggered on instances of double click etc
      // originally kept timeout in state to clear early but it was causing grid animation problems
      if (mouseMove.isWaitingToConcludeDrag) {
        mouseMove.isWaitingToConcludeDrag2 = true;
        setTimeout(() => {
          prepareForDrag(chatToBeMoved, componentIndex);
          mouseMove.isWaitingToConcludeDrag2 = false;
        }, 500); // wait for other animation to finish
      } else {
        prepareForDrag(chatToBeMoved, componentIndex);
      }
    },
  }));

  // need for pre is used for case where dragging started before another chat drag is waiting to conclude
  // hence it allows to move the new chat component to the new mouse position when ready
  function prePrepareForDrag(chatToBeMoved) {
    // need to freeze the height as otherwise when there is one component at bottom and chat is moved down
    // the grid would resize to upper layer
    if (mouseMove.isGridView) componentListRef.current.style.height = `${componentListRef.current.clientHeight}px`;
    const index = chatComponents.findIndex((component) => component.ref === chatToBeMoved);
    const initialRowIndex = Math.floor(index / ROW_LENGTH);
    if (mouseMove.isGridView) {
      const relativeIndex = index - initialRowIndex * ROW_LENGTH;
      mouseMove.initialMarginLeft = relativeIndex * WIDTH;
    } else {
      mouseMove.initialMarginLeft = index * WIDTH;
    }
    mouseMove.maxMarginLeft = mouseMove.isGridView ? (ROW_LENGTH - 1) * WIDTH : (chatComponents.length - 1) * WIDTH;
    if (mouseMove.isGridView) {
      mouseMove.maxMarginTop =
        chatComponents.length - 1 < ROW_LENGTH ? 0 : Math.floor((chatComponents.length - 1) / ROW_LENGTH) * HEIGHT;
      mouseMove.initialMarginTop = initialRowIndex * HEIGHT;
      mouseMove.newMarginTop = mouseMove.initialMarginTop;
    } else {
      mouseMove.initialMarginTop = 0;
      mouseMove.newMarginTop = 0;
    }
    mouseMove.newMarginLeft = mouseMove.initialMarginLeft;
    mouseMove.lastScrollLeft = componentListRef.current.scrollLeft;
    mouseMove.lastScrollTop = window.scrollY;
    mouseMove.earlyTrackMouseMovement = true;
    return index;
  }

  function prepareForDrag(chatToBeMoved, index) {
    mouseMove.newIndex = index;
    mouseMove.initialIndex = mouseMove.newIndex;
    mouseMove.chat = chatToBeMoved;
    mouseMove.chat.current.startDragging(mouseMove.initialMarginLeft, mouseMove.initialMarginTop);
    if (mouseMove.isGridView && (mouseMove.initialIndex + 1) % ROW_LENGTH === 0) {
      mouseMove.previousChat = chatComponents[mouseMove.initialIndex - 1]?.ref.current;
      if (mouseMove.previousChat) {
        mouseMove.previousChat.tempNoAnimation(mouseMove.previousChat.updateMarginRight.bind(this, WIDTH), 0);
      }
      mouseMove.nextChat = null;
    } else {
      mouseMove.previousChat =
        mouseMove.isGridView && mouseMove.initialIndex % ROW_LENGTH === 0
          ? null
          : chatComponents[mouseMove.initialIndex - 1]?.ref.current;
      mouseMove.nextChat = chatComponents[mouseMove.initialIndex + 1]?.ref.current;
      if (mouseMove.nextChat) {
        mouseMove.nextChat.tempNoAnimation(mouseMove.nextChat.updateMarginLeft.bind(this, WIDTH), 0);
      } else if (mouseMove.previousChat) {
        mouseMove.previousChat.updateMarginRight(WIDTH);
      } else {
      }
    }
  }

  function toggleSideChatMarginNoAnim(width) {
    if (mouseMove.nextChat) {
      mouseMove.nextChat.tempNoAnimation(mouseMove.nextChat.updateMarginLeft.bind(this, width), 10);
    } else {
      mouseMove.previousChat?.tempNoAnimation(mouseMove.previousChat.updateMarginRight.bind(this, width), 10);
    }
  }

  function toggleSideChatMargin(width) {
    if (mouseMove.nextChat) {
      mouseMove.nextChat.updateMarginLeft(width);
    } else {
      mouseMove.previousChat?.updateMarginRight(width);
    }
  }

  function changeHeight(isDown) {
    if (mouseMove.nextChat) {
      mouseMove.nextChat.tempNoAnimation(mouseMove.nextChat.updateMarginLeft.bind(this, 0), 10);
    } else {
      mouseMove.previousChat?.tempNoAnimation(mouseMove.previousChat.updateMarginRight.bind(this, 0), 10);
    }
    mouseMove.nextChat = null;
    mouseMove.previousChat = null;
    const newIndex = mouseMove.newIndex + (isDown ? ROW_LENGTH : -ROW_LENGTH);
    // if not right
    if ((mouseMove.newIndex + 1) % ROW_LENGTH !== 0) {
      // initial index affects what the next index should be
      const newNextIndex = newIndex >= mouseMove.initialIndex || newIndex + 1 === mouseMove.initialIndex ? 2 : 1;
      // checks if the next is not on a new line
      if ((newIndex + newNextIndex) % ROW_LENGTH !== 0) {
        mouseMove.nextChat = chatComponents[newIndex + newNextIndex - 1]?.ref.current;
      }
    }
    // if not left
    if (mouseMove.newIndex % ROW_LENGTH !== 0) {
      const newPreviousIndex = newIndex <= mouseMove.initialIndex || newIndex - 1 === mouseMove.initialIndex ? 2 : 1;
      // checks if the next is not on a previous line
      if ((newIndex - newPreviousIndex + 1) % ROW_LENGTH !== 0) {
        mouseMove.previousChat = chatComponents[newIndex - newPreviousIndex + 1]?.ref.current;
      }
    }
    if (chatComponents[newIndex]) {
      toggleSideChatMarginNoAnim(WIDTH);
    }
    mouseMove.initialMarginTop += isDown ? HEIGHT : -HEIGHT;
    mouseMove.newIndex = newIndex;
  }

  function dragChat() {
    // the use of Math.max is important as moving the mouse too quickly will not allow the chat to touch list edge
    let newMarginTop = 0;
    if (mouseMove.isGridView) {
      newMarginTop = Math.max(mouseMove.newMarginTop, 0);
      if (mouseMove.newMarginTop > mouseMove.maxMarginTop) {
        newMarginTop = mouseMove.maxMarginTop;
      }
      mouseMove.chat.current.updateMarginTop(newMarginTop);
    }
    let newMarginLeft = Math.max(mouseMove.newMarginLeft, 0);
    if (
      mouseMove.newMarginLeft > mouseMove.maxMarginLeft &&
      // is last
      (mouseMove.isGridView
        ? (mouseMove.newIndex + 1) % ROW_LENGTH === 0
        : mouseMove.newIndex + 1 === chatComponents.length)
    ) {
      newMarginLeft = mouseMove.maxMarginLeft;
    }
    // need to refactor this for the right/bottom sides
    mouseMove.chat.current.updateMarginLeft(newMarginLeft);
    // right
    if (newMarginLeft > mouseMove.initialMarginLeft + HALF_WIDTH) {
      mouseMove.nextChat?.updateMarginLeft(0);
      mouseMove.previousChat?.updateMarginRight(0);
      mouseMove.previousChat = mouseMove.nextChat;
      if (mouseMove.isGridView && (mouseMove.newIndex + 2) % ROW_LENGTH === 0) {
        mouseMove.nextChat = null;
      } else {
        // initial index affects what the next index should be
        const newNextIndex =
          mouseMove.newIndex >= mouseMove.initialIndex || mouseMove.newIndex + 1 === mouseMove.initialIndex ? 2 : 1;
        mouseMove.nextChat = chatComponents[mouseMove.newIndex + newNextIndex]?.ref.current;
      }
      toggleSideChatMargin(WIDTH);
      mouseMove.initialMarginLeft += WIDTH;
      mouseMove.newIndex += 1;
      // left
    } else if (newMarginLeft < mouseMove.initialMarginLeft - HALF_WIDTH) {
      toggleSideChatMargin(0);
      mouseMove.nextChat = mouseMove.previousChat;
      // initial index affects what the previous index should be
      const newPreviousIndex =
        mouseMove.newIndex <= mouseMove.initialIndex || mouseMove.newIndex - 1 === mouseMove.initialIndex ? 2 : 1;
      mouseMove.previousChat = chatComponents[mouseMove.newIndex - newPreviousIndex]?.ref.current;
      mouseMove.nextChat?.updateMarginLeft(WIDTH);
      mouseMove.initialMarginLeft -= WIDTH;
      mouseMove.newIndex -= 1;
    } else if (mouseMove.isGridView) {
      if (newMarginTop > mouseMove.initialMarginTop + HALF_HEIGHT) {
        changeHeight(true);
      } else if (newMarginTop < mouseMove.initialMarginTop - HALF_HEIGHT) {
        changeHeight(false);
      }
    }
  }

  function concludeDragging(chatRef) {
    mouseMove.isWaitingToConcludeDrag = false;
    if (!chatRef.current) return; // will be null when changing page when dragging
    // the timeout of 10 is necessary for the other animation to finish
    chatRef.current.tempNoAnimation(chatRef.current.concludeDragging, 10);
    mouseMove.nextChat?.tempNoAnimation(mouseMove.nextChat?.updateMarginLeft.bind(this, 0), 10);
    mouseMove.previousChat?.tempNoAnimation(mouseMove.previousChat?.updateMarginRight.bind(this, 0), 10);
    if (mouseMove.newIndex !== mouseMove.initialIndex) {
      const chatComponent = chatComponents[mouseMove.initialIndex];
      chatComponents.splice(mouseMove.initialIndex, 1);
      chatComponents.splice(mouseMove.newIndex, 0, chatComponent);
      refreshList((latestChatIndex.index += 1));
    }
    componentListRef.current.style.height = '';
  }

  function stopDrag() {
    if (mouseMove.chat) {
      if (mouseMove.isGridView && mouseMove.newIndex > chatComponents.length - 1) {
        console.log('call');
        mouseMove.initialMarginLeft -= WIDTH * (mouseMove.newIndex - (chatComponents.length - 1));
        mouseMove.newIndex = chatComponents.length - 1;
      }
      mouseMove.chat.current.releaseDragging(mouseMove.initialMarginLeft, mouseMove.initialMarginTop);
      const chatRef = mouseMove.chat;
      mouseMove.chat = null;
      mouseMove.earlyTrackMouseMovement = false;
      mouseMove.isWaitingToConcludeDrag = true;
      setTimeout(() => {
        concludeDragging(chatRef);
        // needs to be at least animation length or else chat components will move after drag
        // you can test this by having 3 chats and moving middle one to left or right
      }, 500);
    }
  }

  function onMouseMove(event) {
    if (mouseMove.earlyTrackMouseMovement) {
      mouseMove.newMarginLeft += event.movementX;
      mouseMove.newMarginTop += event.movementY;
      if (mouseMove.chat) dragChat();
    }
  }

  function onScroll() {
    if (mouseMove.earlyTrackMouseMovement) {
      mouseMove.newMarginTop += window.scrollY - mouseMove.lastScrollTop;
      if (mouseMove.chat) dragChat();
      mouseMove.lastScrollTop = window.scrollY;
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
    window.addEventListener('scroll', onScroll);
    componentListRef.current.addEventListener('scroll', onListElementScroll);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // need to track state here as react does not update this automatically
  React.useEffect(() => {
    mouseMove.isGridView = isGridView;
  }, [isGridView]);

  return <div ref={ref}></div>;
});

export default Move;
