import ConstructableObject from './serviceConstructableObject';
import PlaygroundSelect from '../../playgroundSelect';
import './serviceOptionalParametersFields.css';
import React from 'react';

function changeFirstLetter(text, capitalize = true) {
  return text.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + text.slice(1);
}

function SelectInput({parameter, configVal, changeCode}) {
  return (
    <PlaygroundSelect
      options={['', ...parameter]}
      defaultOption={configVal}
      onChange={() => setTimeout(changeCode)}
      passValueToChange={false}
    />
  );
}

function Input({parameter, configVal, changeCode}) {
  if (Array.isArray(parameter)) {
    return <SelectInput parameter={parameter} configVal={configVal ?? ''} changeCode={changeCode} />;
  }
  if (parameter === 'constructable object') {
    return <ConstructableObject configVal={configVal} changeCode={changeCode} />;
  }
  return (
    <input
      className="playground-service-modal-input"
      onChange={() => changeCode()}
      defaultValue={configVal ?? ''}
      type={parameter}
    ></input>
  );
}

// toggling the display property instead of not rendering to allow extractOptionalParameterValues to pick it up
// and let buildConfig to match it to the correct config index
function ParameterField({name, isDisplayed, parameter, configVal, changeCode, pseudoNames}) {
  return (
    <div style={{display: isDisplayed ? 'table-row' : 'none'}}>
      <div className="playground-service-modal-input-label playground-service-modal-optional-parameter-input-label">
        {pseudoNames[name] || changeFirstLetter(name)}:{' '}
      </div>
      <Input
        parameter={isDisplayed ? parameter : ''}
        configVal={isDisplayed ? configVal : ''}
        changeCode={changeCode}
      ></Input>
    </div>
  );
}

// WORK - do not display this if there aren't any
const OptionalParameters = React.forwardRef(({optionalParameters, config, changeCode, websocket, pseudoNames}, ref) => {
  return (
    <div ref={ref} className="playgroud-service-modal-form">
      {Object.keys(optionalParameters || {}).map((paramName, index) => {
        return typeof optionalParameters[paramName] === 'object' && !Array.isArray(optionalParameters[paramName]) ? (
          Object.keys(optionalParameters[paramName]).map((innerParamName, index) => {
            return (
              <ParameterField
                key={index}
                name={innerParamName}
                isDisplayed={innerParamName === 'websocket' || !websocket}
                parameter={optionalParameters[paramName][innerParamName]}
                configVal={config?.[paramName]?.[innerParamName]}
                changeCode={changeCode}
                pseudoNames={pseudoNames}
              />
            );
          })
        ) : (
          <ParameterField
            key={index}
            name={paramName}
            isDisplayed={paramName === 'websocket' || !websocket}
            parameter={optionalParameters[paramName]}
            configVal={config?.[paramName]}
            changeCode={changeCode}
            pseudoNames={pseudoNames}
          ></ParameterField>
        );
      })}
    </div>
  );
});

export default OptionalParameters;
