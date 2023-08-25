import PlaygroundSelect from '../../playgroundSelect';
import React from 'react';

export default function ServiceType({availableTypes, activeService, activeType, changeType, pseudoNames}) {
  return (
    <div>
      <a
        href={activeService === 'custom' ? TYPE_TO_LINK[activeService] : TYPE_TO_LINK[activeService]?.[activeType]}
        target="_blank"
        className="playground-service-modal-input-label"
      >
        Type:
      </a>
      <div>
        <PlaygroundSelect
          options={availableTypes}
          defaultOption={activeType}
          onChange={changeType}
          pseudoNames={pseudoNames}
        />
      </div>
    </div>
  );
}

const TYPE_TO_LINK = {
  demo: 'https://deepchat.dev/docs/directConnection/demo',
  custom: 'https://deepchat.dev/docs/connect',
  openAI: {
    chat: 'https://deepchat.dev/docs/directConnection/OpenAI#Chat',
    completions: 'https://deepchat.dev/docs/directConnection/OpenAI#Completions',
    images: 'https://deepchat.dev/docs/directConnection/OpenAI#Images',
    audio: 'https://deepchat.dev/docs/directConnection/OpenAI#Audio',
  },
  cohere: {
    chat: 'https://deepchat.dev/docs/directConnection/Cohere#Chat',
    textGeneration: 'https://deepchat.dev/docs/directConnection/Cohere#TextGeneration',
    summarization: 'https://deepchat.dev/docs/directConnection/Cohere#Summarization',
  },
  huggingFace: {
    conversation: 'https://deepchat.dev/docs/directConnection/HuggingFace#Conversation',
    // textGeneration: true | (HuggingFaceModel & HuggingFaceTextGenerationConfig);
    // summarization: true | (HuggingFaceModel & HuggingFaceSummarizationConfig);
    // translation: true | (HuggingFaceModel & HuggingFaceTranslationConfig);
    // fillMask: true | (HuggingFaceModel & HuggingFaceFillMaskConfig);
    // questionAnswer: HuggingFaceModel & HuggingFaceQuestionAnswerConfig;
    // audioSpeechRecognition: true | HuggingFaceModel;
    // audioClassification: true | HuggingFaceModel;
    // imageClassification: true | HuggingFaceModel;
  },
  azure: {
    textToSpeech: 'https://deepchat.dev/docs/directConnection/Azure#TextToSpeech',
    speechToText: 'https://deepchat.dev/docs/directConnection/Azure#SpeechToText',
    summarization: 'https://deepchat.dev/docs/directConnection/Azure#Summarization',
    translation: 'https://deepchat.dev/docs/directConnection/Azure#Translation',
  },
};
