import ExploreButton from './exploreButton/exploreButton';
import PreloadImages from './preloadImages/preloadImages';
import FadeInContent from './utils/fadeInContent';
import StartPanel from './startPanel/startPanel';
import Features from './features/features';
import FadeInNav from './utils/fadeInNav';
import Footer from './footer/footer';
import Layout from '@theme/Layout';
import React from 'react';
import './index.css';

export default function Home() {
  const homepageContentRef = React.useRef(null);
  return (
    <Layout description="Framework agnostic chat component that can power any API">
      <main>
        <FadeInNav></FadeInNav>
        <PreloadImages></PreloadImages>
        <div id="homepage-content" ref={homepageContentRef} className="invisible-component">
          <StartPanel></StartPanel>
          <Features></Features>
          <ExploreButton></ExploreButton>
          <Footer></Footer>
          <FadeInContent contentRef={homepageContentRef}></FadeInContent>
        </div>
      </main>
    </Layout>
  );
}
