import AddButton from './playground/chat/manipulate/playgroundAddButton';
import ChatComponent from './playground/chat/playgroundChatComponent';
import ChatWrapper from './playground/chat/playgroundChatWrapper';
import ServiceModal from './playground/modal/serviceModal';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import React from 'react';
import './playground.css';

// TO-DO have a config to preset the plaground

// Connect to a custom api - configuration panel
// Connect to a service - insert key panel (info bubble that the key will not be shared)
// Preview the code to generate this
// Differnt shadow/bubble color depending on service used
// Ability to remove a component
// Ability to change view to horizontal overflow or stack all on same screen

// Move
// Reset messages
// Save config
// Load config

// Video to show off how it works

const modalCollapseStates = {optionalParams: true, code: true};
// state kept here as the chat components are not re-rendered when something happens in other components, hence
// they do not have a reference to the latest state
const chatComponents = [];
const latestChatIndex = {index: 0};

export default function Playground() {
  // this is a workaround to force component list render
  const [, refreshList] = React.useState(-1);
  const [editingChatRef, setEditingChatRef] = React.useState(null);
  const componentListRef = React.useRef(null);

  React.useEffect(() => {
    const ref = React.createRef();
    const newConfig = {
      openAI: {},
    };
    refreshList(0);
    const component = (
      <ChatWrapper
        key={0}
        setEditingChatRef={setEditingChatRef}
        moveComponent={moveComponent}
        removeComponent={removeComponent}
        cloneComponent={cloneComponent}
        config={newConfig}
        ref={ref}
      >
        <ChatComponent config={newConfig}></ChatComponent>
      </ChatWrapper>
    );
    chatComponents.push(component);
    setTimeout(() => {
      setEditingChatRef(ref);
    });
  }, []);

  // logic placed here to not have to pass down state to child components
  function addComponent(config, index) {
    refreshList((latestChatIndex.index += 1));
    const isAtEnd = !index || chatComponents.length === index;
    const newComponent = (
      <ChatWrapper
        key={latestChatIndex.index}
        setEditingChatRef={setEditingChatRef}
        moveComponent={moveComponent}
        removeComponent={removeComponent}
        cloneComponent={cloneComponent}
        config={config || {demo: true}}
        isAtEnd={isAtEnd}
        ref={React.createRef()}
      >
        <ChatComponent config={config || {demo: true}}></ChatComponent>
      </ChatWrapper>
    );
    chatComponents.splice(index !== undefined ? index : chatComponents.length, 0, newComponent);
    setTimeout(() => {
      componentListRef.current.scrollLeft = componentListRef.current.scrollWidth;
    }, 5);
  }

  function removeComponent(componentToBeRemoved) {
    componentToBeRemoved.current.fadeOut();
    setTimeout(() => {
      componentToBeRemoved.current.remove();
      setTimeout(() => {
        const index = chatComponents.findIndex((component) => component.ref === componentToBeRemoved);
        chatComponents.splice(index, 1);
        refreshList((latestChatIndex.index += 1));
      }, 400);
    }, 200);
  }

  function cloneComponent(componentToBeCloned) {
    const index = chatComponents.findIndex((component) => component.ref === componentToBeCloned);
    addComponent(componentToBeCloned.current.config, index + 1);
  }

  function moveComponent(componentToBeMoved, isRightward) {
    const initialIndex = chatComponents.findIndex((component) => component.ref === componentToBeMoved);
    const secondIndex = isRightward ? initialIndex + 1 : initialIndex - 1;
    const secondComponent = chatComponents[secondIndex];
    if (!secondComponent) return;
    const initialComponent = chatComponents[initialIndex];
    chatComponents[initialIndex] = secondComponent;
    chatComponents[secondIndex] = initialComponent;
    refreshList((latestChatIndex.index += 1));
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
      <div id="start-page-content">
        <div>
          <div id="playground-title" className={'start-page-title-visible'}>
            <b>Playground</b>
          </div>
          <div>
            <div
              ref={componentListRef}
              style={{
                display: 'flex',
                width: '95vw',
                overflow: 'auto',
                scrollBehavior: 'smooth',
              }}
            >
              {chatComponents}
            </div>
            <AddButton addComponent={addComponent} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
