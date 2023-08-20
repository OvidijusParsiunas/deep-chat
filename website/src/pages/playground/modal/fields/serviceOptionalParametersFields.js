import ConstructableObject from './serviceConstructableObject';
import './serviceOptionalParametersFields.css';
import React from 'react';

function changeFirstLetter(string, capitalize = true) {
  return string.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + string.slice(1);
}

function SelectInput({parameter, configVal, changeCode}) {
  return (
    <select defaultValue={configVal} onChange={() => changeCode()}>
      <option value={''} key={-1}></option>
      {parameter.map((optionName, index) => {
        return (
          <option value={optionName} key={index}>
            {optionName}
          </option>
        );
      })}
    </select>
  );
}

function Input({parameter, configVal, changeCode}) {
  if (Array.isArray(parameter)) {
    return <SelectInput parameter={parameter} configVal={configVal ?? ''} changeCode={changeCode} />;
  }
  if (parameter === 'constructable object') {
    return <ConstructableObject configVal={configVal} changeCode={changeCode} />;
  }
  return <input onChange={() => changeCode()} defaultValue={configVal ?? ''} type={parameter}></input>;
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

const OptionalParameters = React.forwardRef(({optionalParameters, config, changeCode, websocket, pseudoNames}, ref) => {
  return (
    <div ref={ref} id="playground-service-modal-optional-parameters">
      {Object.keys(optionalParameters || {}).map((paramName, index) => {
        return typeof optionalParameters[paramName] === 'object' && !Array.isArray(optionalParameters[paramName]) ? (
          Object.keys(optionalParameters[paramName]).map((innerParamName, index) => {
            return (
              <ParameterField
                key={index}
                name={innerParamName}
                isDisplayed={innerParamName === 'websocket' || !websocket}
                parameter={optionalParameters[paramName][innerParamName]}
                config={config?.[paramName]?.[innerParamName]}
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
            config={config?.[paramName]}
            changeCode={changeCode}
            pseudoNames={pseudoNames}
          ></ParameterField>
        );
      })}
    </div>
  );
});

export default OptionalParameters;
