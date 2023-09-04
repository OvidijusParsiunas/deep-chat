import AddButton from './playground/chat/manipulate/playgroundAddButton';
import ChatComponent from './playground/chat/playgroundChatComponent';
import ChatWrapper from './playground/chat/playgroundChatWrapper';
import ServiceModal from './playground/modal/serviceModal';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import Sortable from 'sortablejs';
import React from 'react';
import './playground.css';

// TO-DO have a config to preset the playground

// Styling of the butttons
// Title based on current service
// Connect to a service - insert key panel (info bubble that the key will not be shared)
// Different shadow/bubble color depending on service used
// Clear messages
// Save config
// Load config

// Video to show off how it works

const modalCollapseStates = {optionalParams: true, code: true};
// state kept here as the chat components are not re-rendered when something happens in other components, hence
// they do not have a reference to the latest state
const chatComponents = [];
const latestChatIndex = {index: 0};
// because components are not refreshed, they will not have access to the latest state, hence this is an alternative to reference it
const view = {isGrid: true, isBeingCreated: true};

export default function Playground() {
  // this is a workaround to force component list render
  const [, refreshList] = React.useState(-1);
  const [editingChatRef, setEditingChatRef] = React.useState(null);
  const [isGridView, setIsGridView] = React.useState(view.isGrid);
  const componentListRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => {
      addComponent();
      setEditingChatRef(ref);
      view.isBeingCreated = false;
      Sortable.create(componentListRef.current, {animation: 450, handle: '.playground-chat-drag-handle'});
    });
    return () => {
      // check if state really needed to be removed as user can navigate pages and comeback to playground
      chatComponents.splice(0, chatComponents.length);
      latestChatIndex.index = 0;
      view.isBeingCreated = false;
    };
  }, []);

  function scrollToNewChat(index, config, elementRef) {
    if (view.isGrid) {
      if (config) {
        if (index - 1 !== 0 && isChatAtEnd(index - 1)) elementRef.scrollIntoView();
      } else {
        window.scrollTo({left: 0, top: document.body.scrollHeight, behavior: 'smooth'});
      }
    }
    if (config) {
      if (!elementRef.isVisibleInParent(componentListRef.current)) {
        componentListRef.current.scrollLeft = componentListRef.current.scrollLeft + 400;
      }
    } else {
      componentListRef.current.scrollLeft = componentListRef.current.scrollWidth;
    }
  }

  function isChatAtEnd(index) {
    let isAtEnd = !index || chatComponents.length === index;
    if (!isAtEnd && view.isGrid) {
      const chatInTarget = chatComponents[index]?.ref.current;
      const chatAfterTarget = chatComponents[index + 1]?.ref.current;
      isAtEnd = !chatAfterTarget || chatAfterTarget.getOffsetTop() !== chatInTarget.getOffsetTop(); // checks if on same row
    }
    return isAtEnd;
  }

  // logic placed here to not have to pass down state to child components
  function addComponent(config, index) {
    // WORK - expand height when on a new row
    // config
    const newConfig = config || {demo: true};
    const ref = React.createRef();
    const newComponent = (
      <ChatWrapper
        key={latestChatIndex.index}
        setEditingChatRef={setEditingChatRef}
        removeComponent={removeComponent}
        cloneComponent={cloneComponent}
        config={newConfig}
        isAtEnd={isChatAtEnd(index)}
        ref={ref}
      >
        <ChatComponent config={newConfig}></ChatComponent>
      </ChatWrapper>
    );
    chatComponents.splice(index !== undefined ? index : chatComponents.length, 0, newComponent);
    refreshList((latestChatIndex.index += 1));
    if (view.isBeingCreated) return;
    setTimeout(() => {
      scrollToNewChat(index, config, ref.current);
    }, 250);
  }

  function removeComponent(componentToBeRemoved) {
    componentToBeRemoved.current.scaleOut();
    setTimeout(() => {
      componentToBeRemoved.current.remove();
      setTimeout(() => {
        const index = chatComponents.findIndex((component) => component.ref === componentToBeRemoved);
        chatComponents.splice(index, 1);
        refreshList((latestChatIndex.index += 1));
      }, 400);
    }, 300);
  }

  function cloneComponent(componentToBeCloned) {
    const index = chatComponents.findIndex((component) => component.ref === componentToBeCloned);
    addComponent(componentToBeCloned.current.config, index + 1);
  }

  function toggleView() {
    setIsGridView((previousValue) => !previousValue);
    view.isGrid = !view.isGrid;
  }

  return (
    <Layout title="Start" description="Deep Chat's official playground">
      <Head>
        <html className="plugin-pages plugin-id-default playground" />
      </Head>
      {editingChatRef && (
        <ServiceModal
          setEditingChatRef={setEditingChatRef}
          chatComponent={editingChatRef.current}
          collapseStates={modalCollapseStates}
        />
      )}
      <div>
        <div id="playground-title" className={'start-page-title-visible'}>
          <b>Playground</b>
        </div>
        <div>
          <div id="playground-chat-list-parent">
            <div
              ref={componentListRef}
              id="playground-chat-list"
              // not using actual grid as dragging does not work due to drag using margins
              style={{display: isGridView ? '' : 'flex'}}
            >
              {chatComponents}
            </div>
          </div>
          <AddButton addComponent={addComponent} />
          <div id="playground-bottom-panel">
            <div id="playground-bottom-buttons">
              <button onClick={toggleView}>Layout</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
