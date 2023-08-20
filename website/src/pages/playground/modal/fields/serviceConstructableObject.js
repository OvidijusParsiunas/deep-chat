import React from 'react';

function add(properties, setProperties, changeCode) {
  setProperties([...properties, {keyName: '', value: ''}]);
  changeCode();
}

function AddButton({properties, setProperties, changeCode}) {
  return (
    <button style={{width: 48}} onClick={() => add(properties, setProperties, changeCode)}>
      Add
    </button>
  );
}

function remove(index, properties, setProperties, changeCode) {
  properties.splice(index, 1);
  setProperties([...properties]);
  setTimeout(() => changeCode());
}

function RemoveButton({index, properties, setProperties, changeCode}) {
  return <button onClick={() => remove(index, properties, setProperties, changeCode)}>Remove</button>;
}

function Field({index, property, properties, setProperties, changeCode}) {
  return (
    <div>
      <div style={{float: 'left', marginRight: '5px', color: '#5e5e5e', fontSize: '15px'}}>
        <input type="string" defaultValue={property.keyName} onChange={() => changeCode()}></input>:
      </div>
      <input type="string" defaultValue={property.value} onChange={() => changeCode()}></input>
      <RemoveButton index={index} properties={properties} setProperties={setProperties} changeCode={changeCode} />
    </div>
  );
}

export default function ConstructableObject({config, changeCode}) {
  const [properties, setProperties] = React.useState(
    Object.keys(config || []).map((property) => ({
      keyName: property,
      value: config[property],
    }))
  );

  return (
    <div style={{display: 'flow-root'}} className={'constructable-object'}>
      {properties.map((property, index) => (
        <Field
          key={index}
          index={index}
          property={property}
          properties={properties}
          setProperties={setProperties}
          changeCode={changeCode}
        />
      ))}
      <AddButton properties={properties} setProperties={setProperties} changeCode={changeCode} />
    </div>
  );
}
