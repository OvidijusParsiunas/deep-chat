import ContainersKeyToggle from './containersKeyToggle';
import ComponentContainer from './componentContainer';
import DeepChatBrowser from './deepChatBrowser';
import React from 'react';

const getCurrentWeather = (location) => {
  location = location.toLowerCase();
  if (location.includes('tokyo')) {
    return JSON.stringify({location, temperature: '10', unit: 'celsius'});
  } else if (location.includes('san francisco')) {
    return JSON.stringify({location, temperature: '72', unit: 'fahrenheit'});
  } else {
    return JSON.stringify({location, temperature: '22', unit: 'celsius'});
  }
};

const chatConfiguration = {
  tools: [
    {
      type: 'function',
      function: {
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
    },
  ],
  function_handler: (functionsDetails) => {
    return functionsDetails.map((functionDetails) => {
      return {
        response: getCurrentWeather(functionDetails.arguments),
      };
    });
  },
};

export default function ContainersKeyToggleFunction() {
  return (
    <ContainersKeyToggle>
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          introMessage={{text: 'Try asking about the weather in a certain location.'}}
          textInput={{placeholder: {text: 'Weather in Tokyo today'}}}
          directConnection={{
            openAI: {
              key: 'placeholder key',
              chat: chatConfiguration,
            },
          }}
        ></DeepChatBrowser>
      </ComponentContainer>
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          introMessage={{text: 'Try asking about the weather in a certain location.'}}
          textInput={{placeholder: {text: 'Weather in Tokyo today'}}}
          directConnection={{
            openAI: {
              chat: chatConfiguration,
            },
          }}
        ></DeepChatBrowser>
      </ComponentContainer>
    </ContainersKeyToggle>
  );
}
