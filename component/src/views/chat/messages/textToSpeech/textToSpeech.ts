export class TextToSpeech {
  public static speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}
