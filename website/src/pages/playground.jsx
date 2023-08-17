import DeepChatBrowser from '../components/table/deepChatBrowser';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import React from 'react';
import './playground.css';

// TO-DO have a config to preset the plaground

// Dropdown
// Connect to a custom api - configuration panel
// Connect to a service - insert key panel (info bubble that the key will not be shared)
// Preview the code to generate this
// Differnt shadow/bubble color depending on service used
// Ability to remove a component

// Save config
// Load config

// Video to show off how it works

function NewComponent() {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setExpanded(true);
    }); // in a timeout as otherwise if add button is spammed the animations will not show
  }, []);

  return (
    <div
      className={`playground-component ${expanded ? 'playground-component-expanded' : 'playground-component-collapsed'}`}
    >
      <DeepChatBrowser
        directConnection={{demo: true}}
        containerStyle={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          borderColor: '#ededed',
          marginLeft: '10px',
          marginRight: '10px',
          width: '20vw',
        }}
      ></DeepChatBrowser>
    </div>
  );
}

// WORK - dark mode?

export default function Start() {
  const [chatCounter, setChatCounter] = React.useState(0);
  const [chatComponents, setChatComponents] = React.useState([<NewComponent key={chatCounter}></NewComponent>]);

  return (
    <Layout title="Start" description="Deep Chat's official playground">
      <Head>
        <html className="plugin-pages plugin-id-default playground" />
      </Head>
      <div id="start-page-content">
        <div>
          <b id="start-page-title" className={'start-page-title-visible'}>
            Playground
          </b>
          <div style={{width: '95vw', overflowX: 'auto', overflowY: 'auto', height: '400px'}}>
            <div style={{display: 'flex'}}>{chatComponents}</div>
            <button
              onClick={() => {
                const newChatCounter = chatCounter + 1;
                setChatCounter(newChatCounter);
                setChatComponents([...chatComponents, <NewComponent key={newChatCounter}></NewComponent>]);
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
