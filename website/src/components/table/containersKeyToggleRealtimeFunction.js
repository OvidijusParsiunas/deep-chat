import ContainersKeyToggle from './containersKeyToggle';
import ComponentContainer from './componentContainer';
import DeepChatBrowser from './deepChatBrowser';
import React from 'react';

const getCurrentWeather = (location) => {
  location = location.toLowerCase();
  console.log(location);
  if (location.includes('tokyo')) {
    return {location, temperature: '10', unit: 'celsius'};
  } else if (location.includes('san francisco')) {
    return {location, temperature: '72', unit: 'fahrenheit'};
  } else {
    return {location, temperature: '22', unit: 'celsius'};
  }
};

const realtimeConfiguration = {
  config: {
    tools: [
      {
        type: 'function',
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA',
            },
            unit: {type: 'string', enum: ['celsius', 'fahrenheit']},
          },
          required: ['location'],
        },
      },
    ],
    function_handler: (functionsDetails) => {
      const {location} = JSON.parse(functionsDetails.arguments);
      return getCurrentWeather(location);
    },
  },
};

export default function ContainersKeyToggleRealtimeFunction() {
  return (
    <ContainersKeyToggle>
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          directConnection={{
            openAI: {
              key: 'placeholder key',
              realtime: realtimeConfiguration,
            },
          }}
        ></DeepChatBrowser>
      </ComponentContainer>
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          directConnection={{
            openAI: {
              realtime: realtimeConfiguration,
            },
          }}
        ></DeepChatBrowser>
      </ComponentContainer>
    </ContainersKeyToggle>
  );
}
