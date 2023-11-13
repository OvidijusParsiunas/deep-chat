import './serviceRequiredField.css';
import React from 'react';

const INVALID_VALUE_CLASS = 'playground-modal-field-invalid';

function onChange(event, setValue) {
  const {value, classList} = event.target;
  setValue(value);
  if (value.trim() === '') {
    classList.add(INVALID_VALUE_CLASS);
  } else {
    classList.remove(INVALID_VALUE_CLASS);
  }
}

// view is used to identify if visibility can be toggled by user
const Required = React.forwardRef(({title, requiredValue, setValue, view, changeCode, link}, ref) => {
  const [isVisible, setIsVisible] = React.useState(!!view?.isKeyVisible);

  return (
    <div>
      <a
        href={link}
        target="_blank"
        id="playground-service-modal-service-type-label"
        className="playground-service-modal-input-label"
      >
        {title}
      </a>
      <input
        className={`playground-service-modal-input ${view ? 'playground-service-modal-visibility-input' : ''}`}
        ref={ref}
        spellCheck={false}
        value={requiredValue}
        onChange={(event) => onChange(event, setValue)}
        type={!view || isVisible ? 'text' : 'password'}
      ></input>
      {view && (
        <div id="visibility-icon-container">
          {isVisible ? (
            <svg
              className="visibility-icon"
              onClick={() => {
                const newState = !view.isKeyVisible;
                view.isKeyVisible = newState;
                setIsVisible(newState);
                changeCode();
              }}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 1200"
              enableBackground="new 0 0 1200 1200"
            >
              <path
                id="path6686"
                d="M779.843,599.925c0,95.331-80.664,172.612-180.169,172.612
                c-99.504,0-180.168-77.281-180.168-172.612c0-95.332,80.664-172.612,180.168-172.612
                C699.179,427.312,779.843,504.594,779.843,599.925z M600,240.521c-103.025,0.457-209.814,25.538-310.904,73.557
                c-75.058,37.122-148.206,89.496-211.702,154.141C46.208,501.218,6.431,549,0,599.981c0.76,44.161,48.13,98.669,77.394,131.763
                c59.543,62.106,130.786,113.018,211.702,154.179c94.271,45.751,198.616,72.092,310.904,73.557
                c103.123-0.464,209.888-25.834,310.866-73.557c75.058-37.122,148.243-89.534,211.74-154.179
                c31.185-32.999,70.962-80.782,77.394-131.763c-0.76-44.161-48.13-98.671-77.394-131.764
                c-59.543-62.106-130.824-112.979-211.74-154.141C816.644,268.36,712.042,242.2,600,240.521z M599.924,329.769
                c156.119,0,282.675,120.994,282.675,270.251c0,149.256-126.556,270.25-282.675,270.25S317.249,749.275,317.249,600.02
                C317.249,450.763,443.805,329.769,599.924,329.769L599.924,329.769z"
              />
            </svg>
          ) : (
            <svg
              version="1.1"
              className="visibility-icon"
              onClick={() => {
                const newState = !view.isKeyVisible;
                view.isKeyVisible = newState;
                setIsVisible(newState);
                changeCode();
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 1200"
              enableBackground="new 0 0 1200 1200"
            >
              <path
                d="
			M669.727,273.516c-22.891-2.476-46.15-3.895-69.727-4.248c-103.025,0.457-209.823,25.517-310.913,73.536
			c-75.058,37.122-148.173,89.529-211.67,154.174C46.232,529.978,6.431,577.76,0,628.74c0.76,44.162,48.153,98.67,77.417,131.764
			c59.543,62.106,130.754,113.013,211.67,154.174c2.75,1.335,5.51,2.654,8.276,3.955l-75.072,131.102l102.005,60.286l551.416-960.033
			l-98.186-60.008L669.727,273.516z M902.563,338.995l-74.927,129.857c34.47,44.782,54.932,100.006,54.932,159.888
			c0,149.257-126.522,270.264-282.642,270.264c-6.749,0-13.29-0.728-19.922-1.172l-49.585,85.84c22.868,2.449,45.99,4.233,69.58,4.541
			c103.123-0.463,209.861-25.812,310.84-73.535c75.058-37.122,148.246-89.529,211.743-154.174
			c31.186-32.999,70.985-80.782,77.417-131.764c-0.76-44.161-48.153-98.669-77.417-131.763
			c-59.543-62.106-130.827-113.013-211.743-154.175C908.108,341.478,905.312,340.287,902.563,338.995L902.563,338.995z
			M599.927,358.478c6.846,0,13.638,0.274,20.361,0.732l-58.081,100.561c-81.514,16.526-142.676,85.88-142.676,168.897
			c0,20.854,3.841,40.819,10.913,59.325c0.008,0.021-0.008,0.053,0,0.074l-58.228,100.854
			c-34.551-44.823-54.932-100.229-54.932-160.182C317.285,479.484,443.808,358.477,599.927,358.478L599.927,358.478z M768.896,570.513
			L638.013,797.271c81.076-16.837,141.797-85.875,141.797-168.603C779.81,608.194,775.724,588.729,768.896,570.513L768.896,570.513z"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
});

export default Required;
