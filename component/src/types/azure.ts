// https://learn.microsoft.com/en-gb/azure/cognitive-services/translator/reference/v3-0-reference
export interface AzureTranslationConfig {
  language?: string;
}

// eslint-disable-next-line max-len
// https://learn.microsoft.com/en-us/azure/cognitive-services/language-service/summarization/quickstart?pivots=rest-api&tabs=document-summarization%2Cwindows
export interface AzureSummarizationConfig {
  language?: string;
}

export interface AzureEndpoint {
  endpoint: string;
}

export interface AzureSpeechToTextConfig {
  lang?: string;
}

// https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/language-support?tabs=tts
// https://speech.microsoft.com/portal/voicegallery
// https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/rest-text-to-speech?tabs=streaming
export interface AzureTextToSpeechConfig {
  lang?: string;
  name?: string;
  gender?: string;
  outputFormat?: string;
}

export interface AzureRegion {
  region: string;
}

export interface Azure {
  textToSpeech?: AzureRegion & AzureTextToSpeechConfig;
  speechToText?: AzureRegion & AzureSpeechToTextConfig;
  summarization?: AzureEndpoint & AzureSummarizationConfig;
  translation?: Partial<AzureRegion> & AzureTranslationConfig;
}
