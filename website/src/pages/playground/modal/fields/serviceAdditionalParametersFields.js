import ConstructableObject from './serviceConstructableObject';
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
  return <input onChange={() => changeCode()} defaultValue={configVal ?? ''} parameter={parameter}></input>;
}

// toggling the display property instead of not rendering to allow extractAdditionalParameterValues to pick it up
// and let buildConfig to match it to the correct config index
function ParameterField({name, isDisplayed, parameter, configVal, changeCode, pseudoNames}) {
  return (
    <div style={{display: isDisplayed ? 'block' : 'none'}}>
      <div
        style={{
          float: parameter !== 'constructable object' ? 'left' : '',
          marginRight: '5px',
          color: '#5e5e5e',
          fontSize: '15px',
        }}
      >
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

const AdditionalParameters = React.forwardRef(
  ({additionalParameters, config, changeCode, websocket, pseudoNames}, ref) => {
    return (
      <div ref={ref}>
        {Object.keys(additionalParameters || {}).map((paramName, index) => {
          return typeof additionalParameters[paramName] === 'object' && !Array.isArray(additionalParameters[paramName]) ? (
            Object.keys(additionalParameters[paramName]).map((innerParamName, index) => {
              return (
                <ParameterField
                  key={index}
                  name={innerParamName}
                  isDisplayed={innerParamName === 'websocket' || !websocket}
                  parameter={additionalParameters[paramName][innerParamName]}
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
              parameter={additionalParameters[paramName]}
              config={config?.[paramName]}
              changeCode={changeCode}
              pseudoNames={pseudoNames}
            ></ParameterField>
          );
        })}
      </div>
    );
  }
);

export default AdditionalParameters;
