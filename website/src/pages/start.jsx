import ConnectToPopularAPI from './start/connectToPopularAPI';
import PreloadStartImages from './preload/preloadStartImages';
import ConnectToCustomAPI from './start/connectToCustomAPI';
import StartSmallScreen from './start/startSmallScreen';
import AIInyourBrowser from './start/aiInYourBrowser';
import CreateComponent from './start/createComponent';
import StartParticles from './start/startParticles';
import Options from './start/options';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import React from 'react';
import './start.css';

function Main() {
  const [optionNumber, setOptionNumber] = React.useState(1);
  const [quickEntryTransition, setQuickEntryTransition] = React.useState(false);
  const [keepHeight, setKeepHeight] = React.useState(false);

  // this is used to set the quickEntryTransition variable to always be true for further transitions pose the first one
  // this should only affect options
  const setOptionNumberWithQuickerTransitions = (optionNumber) => {
    if (!quickEntryTransition) setQuickEntryTransition(true);
    setOptionNumber(optionNumber);
  };

  // this is used to set the setKeepHeight variable to keep the expanded height when moving from popular to custom connections
  const setOptionNumberAndManipulateHeight = (optionNumber, retainHeight) => {
    if (retainHeight) {
      if (!keepHeight) setKeepHeight(true);
    } else if (keepHeight) setKeepHeight(false);
    setOptionNumber(optionNumber);
  };

  return (
    <div id="start-page-main">
      {optionNumber === 1 && (
        <Options
          setOptionNumber={setOptionNumberWithQuickerTransitions}
          options={[
            {text: 'Create a chat component', number: 2},
            {text: 'Connect to a service', number: 3},
            {text: 'AI in your browser', number: 6},
          ]}
          quickEntryTransition={quickEntryTransition}
        ></Options>
      )}
      {optionNumber === 2 && <CreateComponent setOptionNumber={setOptionNumber}></CreateComponent>}
      {optionNumber === 3 && (
        <Options
          setOptionNumber={setOptionNumber}
          options={[
            {text: 'Connect to a popular AI API', number: 4},
            {text: 'Connect to a custom service', number: 5},
            {text: '← Back', number: 1, className: 'start-page-option-back'},
          ]}
          quickEntryTransition={quickEntryTransition}
        ></Options>
      )}
      {optionNumber === 4 && (
        <ConnectToPopularAPI setOptionNumber={setOptionNumberAndManipulateHeight}></ConnectToPopularAPI>
      )}
      {optionNumber === 5 && (
        <ConnectToCustomAPI
          setOptionNumber={setOptionNumberAndManipulateHeight}
          keepHeight={keepHeight}
        ></ConnectToCustomAPI>
      )}
      {optionNumber === 6 && (
        <AIInyourBrowser setOptionNumber={setOptionNumberAndManipulateHeight} keepHeight={keepHeight}></AIInyourBrowser>
      )}
    </div>
  );
}

export default function Start() {
  const [displayTitle, setDisplayTitle] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setDisplayTitle(true);
    }, 400);
  }, []);

  return (
    <Layout title="Start" description="Get Started with Deep Chat">
      <Head>
        <html className="plugin-pages plugin-id-default start" />
      </Head>
      <PreloadStartImages></PreloadStartImages>
      <StartParticles></StartParticles>
      <div id="start-page-content">
        <div>
          <b id="start-page-title" className={displayTitle ? 'start-page-title-visible' : 'start-page-title-not-visible'}>
            Let's get started!
          </b>
          <Main />
          <StartSmallScreen></StartSmallScreen>
        </div>
      </div>
    </Layout>
  );
}
