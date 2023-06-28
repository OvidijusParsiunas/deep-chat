import './exploreButton.css';
import React from 'react';

function TriggerOnVisibile(props) {
  const domRef = React.useRef();
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setVisible(true), 100);
        observer.unobserve(domRef.current);
      }
    });
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={domRef} className={isVisible ? 'explore-button-expanded' : 'explore-button-collapsed'}>
      {props.children}
    </div>
  );
}

export default function ExploreButton() {
  return (
    <TriggerOnVisibile>
      <div id="explore-button-container">
        <a id="explore-button" className="homepage-button" href="docs/table">
          Explore for more
        </a>
      </div>
    </TriggerOnVisibile>
  );
}
