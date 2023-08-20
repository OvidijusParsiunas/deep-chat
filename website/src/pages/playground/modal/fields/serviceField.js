import React from 'react';

export default function Service({activeService, changeService}) {
  return (
    <div style={{width: '100%'}}>
      <div style={{float: 'left', marginRight: '5px'}}>Service:</div>
      <select value={activeService} onChange={(event) => changeService(event.target.value)}>
        <option value="demo">None</option>
        <option value="custom">Custom</option>
        <option value="openAI">OpenAI</option>
        <option value="huggingFace">Hugging Face</option>
        <option value="azure">Azure</option>
        <option value="cohere">Cohere</option>
        <option value="stabilityAI">StabilityAI</option>
        <option value="assemblyAI">AssemblyAI</option>
      </select>
    </div>
  );
}
