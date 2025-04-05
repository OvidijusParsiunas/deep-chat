import {ValidationHandler} from '../../../../../../types/validationHandler';
import {SpeechToTextConfig} from '../../../../../../types/microphone';
import {OnPreResult} from 'speech-to-element/dist/types/options';
import {TextInputEl} from '../../../textInput/textInput';
import {Messages} from '../../../../messages/messages';
import {MicrophoneButton} from '../microphoneButton';
import {DeepChat} from '../../../../../../deepChat';
import SpeechToElement from 'speech-to-element';
import {SilenceSubmit} from './silenceSubmit';

export type ProcessedConfig = SpeechToTextConfig & {onPreResult?: OnPreResult};

export type AddErrorMessage = Messages['addNewErrorMessage'];

export class SpeechToText extends MicrophoneButton {
  private readonly _addErrorMessage: AddErrorMessage;
  private _silenceSubmit?: SilenceSubmit;
  private _validationHandler?: ValidationHandler;
  // New properties for external handler mode
  private readonly _externalHandler?: (audioBlob: Blob) => void;
  private readonly _externalAudioFormat: 'wav' | 'mp3' | 'ogg' = 'wav'; // Default format
  private _isRecordingExternally = false; // State for external mode
  private _mediaRecorder?: MediaRecorder; // Instance for external mode
  private _mediaStream?: MediaStream; // Stream for external mode
  private _audioChunks: Blob[] = []; // Chunks for external mode blob
  public static readonly MICROPHONE_RESET_TIMEOUT_MS = 300;

  constructor(deepChat: DeepChat, textInput: TextInputEl, addErrorMessage: AddErrorMessage) {
    const config = typeof deepChat.speechToText === 'object' ? deepChat.speechToText : {};
    super(config?.button);
    this._addErrorMessage = addErrorMessage;

    // Always process configuration to ensure properties like _silenceSubmit are set
    const {serviceName, processedConfig} = this.processConfiguration(textInput, config);

    // Check for external handler mode FIRST
    if (config.externalHandler) {
      this._externalHandler = config.externalHandler;
      this._externalAudioFormat = config.externalAudioFormat || 'wav';
      this.elementRef.onclick = this.externalHandlerClick.bind(this);
      // Note: We processed config, but don't use serviceName/processedConfig for SpeechToElement here
    } else {
      // Original setup path for webspeech or azure
      // Check for SpeechToElement support *here* after static import is restored
      if (serviceName === 'webspeech' && !SpeechToElement.isWebSpeechSupported()) {
        this.changeToUnsupported();
      } else {
        // serviceName here will be 'webspeech' or 'azure'
        const isInputEnabled = !deepChat.textInput || !deepChat.textInput.disabled;
        this.elementRef.onclick = this.buttonClick.bind(this, textInput, isInputEnabled, serviceName, processedConfig);
      }
    }

    setTimeout(() => {
      this._validationHandler = deepChat._validationHandler;
    });
  }

  // prettier-ignore
  private processConfiguration(textInput: TextInputEl, config?: boolean | SpeechToTextConfig):
      {serviceName: string, processedConfig: ProcessedConfig} {
    const newConfig = typeof config === 'object' ? config : {};
    const webSpeechConfig = typeof newConfig.webSpeech === 'object' ? newConfig.webSpeech : {};
    const azureConfig = newConfig.azure || {};
    const processedConfig: ProcessedConfig = {
      displayInterimResults: newConfig.displayInterimResults ?? undefined,
      textColor: newConfig.textColor ?? undefined,
      translations: newConfig.translations ?? undefined,
      commands: newConfig.commands ?? undefined,
      events: newConfig.events ?? undefined,
      ...webSpeechConfig,
      ...azureConfig,
    };
    const submitPhrase = newConfig.commands?.submit;
    if (submitPhrase) {
      // Restore synchronous onPreResult
      processedConfig.onPreResult = (text: string) => {
        if (text.toLowerCase().includes(submitPhrase)) {
          // wait for command words to be removed
          setTimeout(() => textInput.submit?.());
          // Use static import directly
          SpeechToElement.endCommandMode();
          return {restart: true, removeNewText: true};
        }
        return null;
      };
    }
    if (newConfig.submitAfterSilence) {
      this._silenceSubmit = new SilenceSubmit(newConfig.submitAfterSilence, newConfig.stopAfterSubmit);
    }
    const serviceName = SpeechToText.getServiceName(newConfig);
    return {serviceName, processedConfig};
  }

  private static getServiceName(config: SpeechToTextConfig): 'webspeech' | 'azure' | 'external' {
    if (config.externalHandler) return 'external'; // Identify external mode
    return config.azure ? 'azure' : 'webspeech';
  }

  // Restore original buttonClick (non-async)
  private buttonClick(textInput: TextInputEl, isInputEnabled: boolean, serviceName: string, config?: ProcessedConfig) {
    // Extra safeguard: If external handler is somehow configured and this method is called, do nothing.
    if (this._externalHandler) {
      return;
    }
    // Use static import directly
    const events = config?.events;
    textInput.removePlaceholderStyle();
    SpeechToElement.toggle(serviceName as 'webspeech', {
      insertInCursorLocation: false,
      element: isInputEnabled ? textInput.inputElementRef : undefined,
      onError: () => {
        this.onError();
        this._silenceSubmit?.clearSilenceTimeout();
      },
      onStart: () => {
        this.changeToActive();
        events?.onStart?.();
      },
      onStop: () => {
        this._validationHandler?.();
        this._silenceSubmit?.clearSilenceTimeout();
        this.changeToDefault();
        events?.onStop?.();
      },
      onPauseTrigger: (isStart: boolean) => {
        this._silenceSubmit?.onPause(isStart, textInput, this.elementRef.onclick as () => void);
        events?.onPauseTrigger?.(isStart);
      },
      onPreResult: (text: string, isFinal: boolean) => {
        events?.onPreResult?.(text, isFinal);
      },
      onResult: (text: string, isFinal: boolean) => {
        if (isFinal) this._validationHandler?.();
        this._silenceSubmit?.resetSilenceTimeout(textInput, this.elementRef.onclick as () => void);
        events?.onResult?.(text, isFinal);
      },
      onCommandModeTrigger: (isStart: boolean) => {
        this.onCommandModeTrigger(isStart);
        events?.onCommandModeTrigger?.(isStart);
      },
      ...config,
    });
  }

  /**
   * Handles the logic for starting and stopping external audio recording.
   *
   * ### Flow/Logic:
   * 1. **Start Recording**:
   *    - Checks if recording is not already in progress (`_isRecordingExternally`).
   *    - Requests microphone access using `navigator.mediaDevices.getUserMedia`.
   *    - Updates the button state to active upon successful permission.
   *    - Initializes a `MediaRecorder` with the acquired audio stream and options.
   *    - Sets up event handlers:
   *      - `ondataavailable`: Collects audio chunks when data is available.
   *      - `onstop`: Processes the collected audio chunks into a `Blob`, invokes the external handler, and cleans up.
   *    - Starts the recording process.
   *
   * 2. **Stop Recording**:
   *    - If recording is in progress, stops the `MediaRecorder`, triggering the `onstop` handler.
   *    - Resets the button state and updates the recording state immediately.
   *
   * 3. **Error Handling**:
   *    - If an error occurs during microphone access or recording setup:
   *      - Invokes the error handler (`onError`).
   *      - Resets the button state and recording state.
   *      - Cleans up any partially acquired media stream.
   *
   * @private
   * @async
   * @throws Will invoke the `onError` handler if microphone access fails or another error occurs.
   */
  private async externalHandlerClick() {
    if (!this._isRecordingExternally) {
      try {
        this._mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
        this.changeToActive(); // Update button state only after permission granted
        this._isRecordingExternally = true;
        this._audioChunks = []; // Reset chunks
        const options = this.getMediaRecorderOptions();
        this._mediaRecorder = new MediaRecorder(this._mediaStream, options);

        this._mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this._audioChunks.push(event.data);
          }
        };

        this._mediaRecorder.onstop = () => {
          const mimeType = this.getMimeType();
          const audioBlob = new Blob(this._audioChunks, {type: mimeType});
          if (this._externalHandler) {
            this._externalHandler(audioBlob); // Call the provided handler
          }
          // Clean up stream tracks
          this._mediaStream?.getTracks().forEach((track) => track.stop());
          this._mediaStream = undefined;
          this._audioChunks = []; // Clear chunks after processing
        };

        this._mediaRecorder.start();
      } catch (_error) {
        this.onError(); // Use existing error handler if appropriate
        this.changeToDefault(); // Reset button state on error
        this._isRecordingExternally = false; // Reset recording state
        // Clean up potentially partially acquired stream
        this._mediaStream?.getTracks().forEach((track) => track.stop());
        this._mediaStream = undefined;
      }
    } else {
      if (this._mediaRecorder && this._mediaRecorder.state === 'recording') {
        this._mediaRecorder.stop(); // This will trigger the 'onstop' handler to process and send the blob
      }
      // State changes (isRecordingExternally=false, button state) are handled in onstop or error handlers
      this.changeToDefault(); // Ensure button resets visually immediately
      this._isRecordingExternally = false; // Update state immediately
    }
  }

  // Helper to get MIME type based on configuration
  private getMimeType(): string {
    switch (this._externalAudioFormat) {
      case 'mp3':
        return 'audio/mpeg'; // Note: Browser support for MP3 recording varies
      case 'ogg':
        return 'audio/ogg; codecs=opus'; // Common format
      case 'wav':
      default:
        return 'audio/wav'; // Safe default
    }
  }

  // Helper to get MediaRecorder options (optional, for future extension)
  private getMediaRecorderOptions(): MediaRecorderOptions {
    const mimeType = this.getMimeType();
    const options: MediaRecorderOptions = {};
    if (MediaRecorder.isTypeSupported(mimeType)) {
      options.mimeType = mimeType;
    } else {
      console.warn(`MIME type ${mimeType} not supported for recording, using browser default.`);
    }
    // Can add audioBitsPerSecond etc. here if needed
    return options;
  }

  private onCommandModeTrigger(isStart: boolean) {
    if (isStart) {
      this.changeToCommandMode();
    } else {
      this.changeToActive();
    }
  }

  private onError() {
    this._addErrorMessage('speechToText', 'speech input error');
  }

  public static toggleSpeechAfterSubmit(microphoneButton: HTMLElement, stopAfterSubmit = true) {
    microphoneButton.click();
    if (!stopAfterSubmit) setTimeout(() => microphoneButton.click(), SpeechToText.MICROPHONE_RESET_TIMEOUT_MS);
  }
}
