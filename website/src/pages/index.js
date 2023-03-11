import ExploreButton from './exploreButton/exploreButton';
import SmallScreen from './smallScreen/smallScreen';
import StartPanel from './startPanel/startPanel';
import Features from './features/features';
import FadeInNav from './utils/fadeInNav';
import Footer from './footer/footer';
import Layout from '@theme/Layout';
import React from 'react';
import './index.css';

export default function Home() {
  return (
    <Layout description="Fully customisable editable table component">
      <main>
        <FadeInNav></FadeInNav>
        <div id="homepage-content">
          <StartPanel></StartPanel>
          {/* TO-DO - fade in here does not work when screen is wide */}
          <Features></Features>
          <SmallScreen></SmallScreen>
          <ExploreButton></ExploreButton>
          <Footer></Footer>
        </div>
      </main>
    </Layout>
  );
}
