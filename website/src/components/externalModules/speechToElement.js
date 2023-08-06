import SpeechToElement from 'speech-to-element';

export function checkWebSpeechSupport() {
  setTimeout(() => {
    if (!SpeechToElement.isWebSpeechSupported()) {
      const errorElement = document.getElementById('web-speech-not-supported-error');
      errorElement.style.display = 'block';
    }
  }, 2);
}
