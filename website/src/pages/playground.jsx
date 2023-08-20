import DeepChatBrowser from '../components/table/deepChatBrowser';
import ConfigModal from './playground/configModal';
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

const NewComponent = React.forwardRef(
  ({setModalDisplayed, setActiveModalConfig, setActiveModalComponentRef, config}, ref) => {
    React.useImperativeHandle(ref, () => ({
      update() {
        setCounter(counter + 1);
      },
    }));
    const [expanded, setExpanded] = React.useState(false);
    const [counter, setCounter] = React.useState(0);

    React.useEffect(() => {
      setTimeout(() => {
        setExpanded(true);
      }); // in a timeout as otherwise if add button is spammed the animations will not show
    }, []);

    return (
      <div
        key={counter}
        className={`playground-component ${expanded ? 'playground-component-expanded' : 'playground-component-collapsed'}`}
      >
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

        {/* The button is going to turn into the active logo */}
        <button
          onClick={() => {
            setActiveModalConfig(config);
            setActiveModalComponentRef(ref);
            setModalDisplayed(true);
          }}
        >
          Configure
        </button>
        <button
          onClick={() => {
            setCounter(counter + 1);
          }}
        >
          Refresh
        </button>
        {/* Option description for chat at bottom or at top */}
      </div>
    );
  }
);

export default function Playground() {
  const [chatCounter, setChatCounter] = React.useState(0);
  const [modalDisplayed, setModalDisplayed] = React.useState(false);
  const [configs, setConfigs] = React.useState([{}]);
  const [activeModalConfig, setActiveModalConfig] = React.useState(null);
  const [activeModalComponentRef, setActiveModalComponentRef] = React.useState(null);
  const [chatComponents, setChatComponents] = React.useState([]);
  const components = React.useRef(null);

  React.useEffect(() => {
    const ref = React.createRef();
    const newChatCounter = chatCounter + 1;
    const newConfig = {
      openAI: {},
    };
    setChatCounter(newChatCounter);
    setConfigs([...configs, newConfig]);
    setChatComponents([
      ...chatComponents,
      <NewComponent
        key={newChatCounter}
        setModalDisplayed={setModalDisplayed}
        setActiveModalConfig={setActiveModalConfig}
        setActiveModalComponentRef={setActiveModalComponentRef}
        config={newConfig}
        ref={ref}
      ></NewComponent>,
    ]);
    setActiveModalConfig(newConfig);
    setActiveModalComponentRef(ref);
    setModalDisplayed(true);
  }, []);

  return (
    <Layout title="Start" description="Deep Chat's official playground">
      <Head>
        <html className="plugin-pages plugin-id-default playground" />
      </Head>
      {modalDisplayed && (
        <ConfigModal
          setModalDisplayed={setModalDisplayed}
          activeConfig={activeModalConfig}
          component={activeModalComponentRef}
        />
      )}
      <div id="start-page-content">
        <div>
          <div id="playground-title" className={'start-page-title-visible'}>
            <b>Playground</b>
          </div>
          <div>
            <div
              ref={components}
              style={{
                display: 'flex',
                width: '95vw',
                overflow: 'auto',
                scrollBehavior: 'smooth',
              }}
            >
              {chatComponents}
            </div>
            <button
              onClick={() => {
                const newChatCounter = chatCounter + 1;
                const newConfig = {demo: true};
                setChatCounter(newChatCounter);
                setConfigs([...configs, newConfig]);
                setChatComponents([
                  ...chatComponents,
                  <NewComponent
                    key={newChatCounter}
                    setModalDisplayed={setModalDisplayed}
                    setActiveModalConfig={setActiveModalConfig}
                    setActiveModalComponentRef={setActiveModalComponentRef}
                    config={newConfig}
                    ref={React.createRef()}
                  ></NewComponent>,
                ]);
                setTimeout(() => {
                  components.current.scrollLeft = components.current.scrollWidth;
                }, 5);
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
