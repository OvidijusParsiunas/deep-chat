import SpeechToElement from 'speech-to-element';

export function checkWebSpeechSupport() {
  setTimeout(() => {
    if (!SpeechToElement.isWebSpeechSupported()) {
      const errorElements = document.getElementsByClassName('web-speech-not-supported-error');
      Array.from(errorElements).forEach((element) => {
        element.style.display = 'block';
      });
    }
  }, 2);
}
