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

// OpenAI configuration
const openAIChatConfiguration = {
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

// Gemini configuration
const geminiChatConfiguration = {
  tools: [
    {
      functionDeclarations: [
        {
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

// Claude configuration
const claudeConfiguration = {
  tools: [
    {
      name: 'get_weather',
      description: 'Get the current weather in a given location',
      input_schema: {
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
    return functionsDetails.map((functionDetails) => {
      return {
        response: getCurrentWeather(functionDetails.arguments),
      };
    });
  },
};

// Ollama configuration
const ollamaConfiguration = {
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

export default function ContainersKeyToggleChatFunction({service = 'openAI', withKeyToggle = true}) {
  const placeholderKey = 'placeholder key';
  const getDirectConnection = (withKey = true) => {
    switch (service) {
      case 'gemini':
        return {
          gemini: {
            ...(withKey && {key: placeholderKey}),
            ...geminiChatConfiguration,
          },
        };
      case 'claude':
        return {
          claude: {
            ...(withKey && {key: placeholderKey}),
            ...claudeConfiguration,
          },
        };
      case 'ollama':
        return {
          ollama: {
            // Ollama doesn't need an API key since it runs locally
            ...ollamaConfiguration,
          },
        };
      case 'openAI':
        return {
          openAI: {
            ...(withKey && {key: placeholderKey}),
            chat: openAIChatConfiguration,
          },
        };
      case 'groq':
        return {
          groq: {
            ...(withKey && {key: placeholderKey}),
            chat: openAIChatConfiguration,
          },
        };
      case 'bigModel':
        return {
          bigModel: {
            ...(withKey && {key: placeholderKey}),
            chat: openAIChatConfiguration,
          },
        };
      default:
        return {
          [service]: {
            ...(withKey && {key: placeholderKey}),
            ...openAIChatConfiguration,
          },
        };
    }
  };

  if (!withKeyToggle) {
    return (
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          introMessage={{text: 'Try asking about the weather in a certain location.'}}
          textInput={{placeholder: {text: 'Weather in Tokyo today'}}}
          directConnection={getDirectConnection(service === 'ollama' ? false : true)}
        ></DeepChatBrowser>
      </ComponentContainer>
    );
  }

  return (
    <ContainersKeyToggle>
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          introMessage={{text: 'Try asking about the weather in a certain location.'}}
          textInput={{placeholder: {text: 'Weather in Tokyo today'}}}
          directConnection={getDirectConnection(true)}
        ></DeepChatBrowser>
      </ComponentContainer>
      <ComponentContainer>
        <DeepChatBrowser
          style={{borderRadius: '8px'}}
          introMessage={{text: 'Try asking about the weather in a certain location.'}}
          textInput={{placeholder: {text: 'Weather in Tokyo today'}}}
          directConnection={getDirectConnection(false)}
        ></DeepChatBrowser>
      </ComponentContainer>
    </ContainersKeyToggle>
  );
}
