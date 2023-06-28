import React from 'react';

export default function OnVisibleAnimation({children, beforeClass, afterClass, timeoutMS}) {
  const domRef = React.useRef();
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (timeoutMS !== undefined) {
          setTimeout(() => setVisible(true), timeoutMS || 0);
        } else {
          setVisible(true);
        }
        observer.unobserve(domRef.current);
      }
    });
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={domRef} className={isVisible ? afterClass : beforeClass}>
      {children}
    </div>
  );
}
