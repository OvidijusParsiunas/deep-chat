import PlaygroundSelect from '../../playgroundSelect';
import React from 'react';

function changeFirstLetter(text, capitalize = true) {
  if (typeof text === 'boolean') return text;
  text ??= '';
  return text.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + text.slice(1);
}

export default function ServiceType({availableTypes, activeService, activeType, changeType, pseudoNames, modalRef}) {
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
          options={(availableTypes || []).map((type) => changeFirstLetter(type, true))}
          defaultOption={changeFirstLetter(activeType, true)}
          onChange={changeType}
          pseudoNames={pseudoNames}
          modalRef={modalRef}
        />
      </div>
    </div>
  );
}

const TYPE_TO_LINK = {
  demo: 'https://deepchat.dev/docs/demo#demo',
  custom: 'https://deepchat.dev/docs/connect',
  webModel: 'https://deepchat.dev/docs/webModel',
  openAI: {
    chat: 'https://platform.openai.com/docs/api-reference/chat',
    assistant: 'https://platform.openai.com/docs/api-reference/assistants',
    images: 'https://platform.openai.com/docs/api-reference/images',
    textToSpeech: 'https://platform.openai.com/docs/api-reference/audio/createSpeech',
    speechToText: 'https://platform.openai.com/docs/api-reference/audio/createTranscription',
  },
  cohere: {
    chat: 'https://docs.cohere.com/docs/conversational-ai',
    textGeneration: 'https://docs.cohere.com/docs/intro-text-generation',
    summarization: 'https://docs.cohere.com/docs/summarize',
  },
  huggingFace: {
    conversation: 'https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task',
    textGeneration: 'https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task',
    summarization: 'https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task',
    translation: 'https://huggingface.co/docs/api-inference/detailed_parameters#translation-task',
    fillMask: 'https://huggingface.co/docs/api-inference/detailed_parameters#fill-mask-task',
    questionAnswer: 'https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task',
    audioSpeechRecognition:
      'https://huggingface.co/docs/api-inference/detailed_parameters#automatic-speech-recognition-task',
    audioClassification: 'https://huggingface.co/docs/api-inference/detailed_parameters#audio-classification-task',
    imageClassification: 'https://huggingface.co/docs/api-inference/detailed_parameters#image-classification-task',
  },
  azure: {
    textToSpeech:
      'https://learn.microsoft.com/en-GB/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming#convert-text-to-speech',
    speechToText: 'https://learn.microsoft.com/en-gb/azure/ai-services/speech-service/rest-speech-to-text',
    summarization:
      'https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview?tabs=document-summarization',
    translation: 'https://learn.microsoft.com/en-gb/azure/ai-services/translator/reference/v3-0-reference',
  },
  stabilityAI: {
    textToImage: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage',
    imageToImage: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage',
    imageToImageMasking: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking',
    imageToImageUpscale: 'https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage',
  },
  assemblyAI: {
    audio: 'https://www.assemblyai.com/docs/Models/speech_recognition',
  },
};
