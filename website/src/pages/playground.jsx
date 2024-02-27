import InformationModal from './playground/header/information/modal/playgroundInformationModal';
import {importWebLLM} from '../components/externalModules/externalModules';
import AddButton from './playground/chat/manipulate/playgroundAddButton';
import HeaderButtons from './playground/header/playgroundHeaderButtons';
import PreloadPlaygroundImages from './preload/preloadPlaygroundImages';
import ChatComponent from './playground/chat/playgroundChatComponent';
import ChatWrapper from './playground/chat/playgroundChatWrapper';
import ServiceModal from './playground/serviceModal/serviceModal';
import './playground/modal/playgroundModal.css';
import {Tooltip} from 'react-tooltip';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import Sortable from 'sortablejs';
import hljs from 'highlight.js';
import React from 'react';
import './playground.css';

// Different shadow/bubble color depending on service used

// TO-DO - when the user is typing in one chat and hits tab - focus next
const playgroundConfig = {
  components: [{connect: {demo: true}, messages: [], description: ''}],
  isFirstTime: true,
  viewMode: 1,
};
const modalCollapseStates = {optionalParams: true, code: true};
// state kept here as the chat components are not re-rendered when something happens in other components, hence
// they do not have a reference to the latest state
const chatComponents = [];
const latestChatIndex = {index: 0};
// because components are not refreshed, they will not have access to the latest state, hence this is an alternative to reference it
const view = {isBeingCreated: true, isKeyVisible: false};

export default function Playground() {
  // this is a workaround to force component list render
  const [, refreshList] = React.useState(-1);
  const [viewMode, setViewMode] = React.useState(1); // need state here for reactiveness
  const [editingChatRef, setEditingChatRef] = React.useState(null);
  const [isIntroModalDisplayed, setIsIntroModalDisplayed] = React.useState(false);
  const [isWaitingToCloseIntroModal, setIsWaitingToCloseIntroModal] = React.useState(false);
  const componentListRef = React.useRef(null);

  React.useEffect(() => {
    window.addEventListener('beforeunload', recordConfig); // before leaving the website
    setTimeout(() => {
      if (localStorage.getItem('deep-chat-config')) overwriteDefaultConfig();
      setViewMode(playgroundConfig.viewMode);
      if (playgroundConfig.isFirstTime) {
        setTimeout(() => {
          setIsIntroModalDisplayed(true);
          setIsWaitingToCloseIntroModal(true);
        }, 350);
      } else {
        applyPlaygroundConfig(playgroundConfig);
        view.isBeingCreated = false;
      }
      Sortable.create(componentListRef.current, sortableConfig);
      setHorizontalScroll(componentListRef.current);
    });
    importWebLLM();
    return () => {
      window.removeEventListener('beforeunload', recordConfig);
      recordConfig();
      chatComponents.splice(0, chatComponents.length);
      latestChatIndex.index = 0;
      view.isBeingCreated = true;
      view.isKeyVisible = false;
    };
  }, []);

  React.useEffect(() => {
    window.hljs = hljs;
    if (isWaitingToCloseIntroModal) {
      setTimeout(() => {
        applyPlaygroundConfig(playgroundConfig);
        view.isBeingCreated = false;
        playgroundConfig.isFirstTime = false;
      }, 400);
    }
  }, [isIntroModalDisplayed]);

  const recordConfig = () => {
    localStorage.setItem('deep-chat-config', JSON.stringify(playgroundConfig));
  };

  function scrollToNewChat(index, wasCloned, elementRef) {
    if (playgroundConfig.viewMode === 1) {
      if (wasCloned) {
        if (index - 1 !== 0 && isChatAtEnd(index - 1)) elementRef.scrollIntoView();
      } else {
        window.scrollTo({left: 0, top: document.body.scrollHeight, behavior: 'smooth'});
      }
    } else if (playgroundConfig.viewMode === 3 && chatComponents.length > 1) {
      const targetIndex = wasCloned ? index : chatComponents.length - 1;
      window.scrollTo({left: 0, top: chatComponents[targetIndex]?.ref.current.getOffsetTop() + 55, behavior: 'smooth'});
    }
    if (wasCloned) {
      if (!elementRef.isVisibleInParent(componentListRef.current)) {
        componentListRef.current.scrollLeft = componentListRef.current.scrollLeft + 400;
      }
    } else {
      componentListRef.current.scrollLeft = componentListRef.current.scrollWidth;
    }
  }

  function isChatAtEnd(index) {
    let isAtEnd = !index || chatComponents.length === index;
    if (!isAtEnd && playgroundConfig.viewMode === 1) {
      const chatInTarget = chatComponents[index]?.ref.current;
      const chatAfterTarget = chatComponents[index + 1]?.ref.current;
      isAtEnd = !chatAfterTarget || chatAfterTarget.getOffsetTop() !== chatInTarget.getOffsetTop(); // checks if on same row
    }
    return isAtEnd;
  }

  // logic placed here to not have to pass down state to child components
  function addComponent(config, index) {
    const newConfig = config || {connect: {demo: true}, description: '', messages: []};
    const ref = React.createRef();
    const newComponent = (
      <ChatWrapper
        key={latestChatIndex.index}
        config={newConfig}
        setEditingChatRef={setEditingChatRef}
        removeComponent={removeComponent}
        cloneComponent={cloneComponent}
        isAtEnd={isChatAtEnd(index)}
        ref={ref}
      >
        <ChatComponent config={newConfig}></ChatComponent>
      </ChatWrapper>
    );
    chatComponents.splice(index !== undefined ? index : chatComponents.length, 0, newComponent);
    refreshList((latestChatIndex.index += 1));
    if (view.isBeingCreated) return;
    playgroundConfig.components.splice(index !== undefined ? index : chatComponents.length, 0, newConfig);
    const timeout = config ? 50 : 5; // cloning and auto scrolling in panorama does not work
    setTimeout(() => {
      scrollToNewChat(index, !!config?.connect, ref.current);
    }, timeout);
  }

  // prettier-ignore
  function removeComponent(componentToBeRemoved) {
    componentToBeRemoved.current.scaleOut();
    if (playgroundConfig.viewMode === 1) componentToBeRemoved.current.reduceHeightWhenLastOnRow();
    if (playgroundConfig.viewMode === 3) componentToBeRemoved.current.reduceHeight(chatComponents.length === 1);
    const componentIndex = playgroundConfig.components.findIndex(
      (component) => component === componentToBeRemoved.current.config
    );
    playgroundConfig.components.splice(componentIndex, 1);
    setTimeout(() => {
      componentToBeRemoved.current.remove();
      setTimeout(() => {
        const index = chatComponents.findIndex((component) => component.ref === componentToBeRemoved);
        chatComponents.splice(index, 1);
        refreshList((latestChatIndex.index += 1));
      }, playgroundConfig.viewMode === 3 ? 300 : 400);
    }, playgroundConfig.viewMode === 3 ? 0 : 300);
  }

  function cloneComponent(componentToBeCloned) {
    const index = chatComponents.findIndex((component) => component.ref === componentToBeCloned);
    const newConfig = JSON.parse(JSON.stringify(componentToBeCloned.current.config));
    addComponent(newConfig, index + 1);
  }

  function toggleLayout() {
    const newMode = (viewMode % 3) + 1;
    playgroundConfig.viewMode = newMode;
    setViewMode(newMode);
  }

  function overwriteDefaultConfig() {
    Object.assign(playgroundConfig, JSON.parse(localStorage.getItem('deep-chat-config')));
  }

  function applyPlaygroundConfig(newConfig) {
    chatComponents.splice(0, chatComponents.length);
    refreshList((latestChatIndex.index += 1));
    newConfig.components.forEach((component) => {
      addComponent(component);
    });
  }

  const sortableConfig = {
    animation: 450,
    handle: '.playground-chat-drag-handle',
    onEnd: (event) => {
      if (event.oldIndex !== event.newIndex) {
        const configToMove = playgroundConfig.components.splice(event.oldIndex, 1)[0];
        playgroundConfig.components.splice(event.newIndex, 0, configToMove);
        const componentToMove = chatComponents.splice(event.oldIndex, 1)[0];
        chatComponents.splice(event.newIndex, 0, componentToMove);
      }
    },
  };

  return (
    <Layout title="Playground" description="Deep Chat Playground">
      <Head>
        <html className="plugin-pages plugin-id-default playground" />
      </Head>
      <PreloadPlaygroundImages />
      {editingChatRef && (
        <ServiceModal
          setEditingChatRef={setEditingChatRef}
          chatComponent={editingChatRef.current}
          collapseStates={modalCollapseStates}
          view={view}
        />
      )}
      {isIntroModalDisplayed && <InformationModal setIsModalDisplayed={setIsIntroModalDisplayed} isIntro={true} />}
      <Tooltip id="chat-wrapper-configuration-tooltip" />
      <div id="playground" className={viewModeToClasses[viewMode].playground}>
        <div id="playground-title" className={'start-page-title-visible'}>
          <b>Playground</b>
          <HeaderButtons viewMode={viewMode} toggleLayout={toggleLayout}></HeaderButtons>
        </div>
        <div>
          <div id="playground-chat-list-parent">
            <div ref={componentListRef} id="playground-chat-list" className={viewModeToClasses[viewMode].chatList}>
              {chatComponents}
            </div>
          </div>
          <AddButton viewMode={viewMode} addComponent={addComponent} />
        </div>
      </div>
    </Layout>
  );
}

// 1 - grid
// 2 - panorama
// 3 - expanded
const viewModeToClasses = {
  1: {
    playground: 'playground-grid',
    chatList: 'playground-chat-list-grid',
  },
  2: {
    playground: 'playground-panorama',
    chatList: 'playground-chat-list-panorama',
  },
  3: {
    playground: 'playground-expanded',
    chatList: 'playground-chat-list-expanded',
  },
};

function setHorizontalScroll(componentList) {
  componentList.addEventListener(
    'wheel',
    (e) => {
      if (playgroundConfig.viewMode === 2) {
        // scroll only when there is overflow (useful when 1 element in column and no overflow)
        if (componentList.scrollWidth > componentList.clientWidth) {
          e.preventDefault();
          componentList.scrollLeft += e.deltaY;
        }
      }
    },
    {passive: false}
  );
}
