import React from 'react';

export default function AddButton({addComponent}) {
  return <button onClick={() => addComponent()}>Add</button>;
}
