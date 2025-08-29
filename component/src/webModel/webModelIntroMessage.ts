import {WebModelIntro} from '../types/webModel/webModel';
import {WebModel} from './webModel';

export class WebModelIntroMessage {
  private static readonly DOWNLOAD_BUTTON_CLASS = 'deep-chat-download-button';
  private static readonly UPLOAD_BUTTON_CLASS = 'deep-chat-upload-button';
  private static readonly FILE_INPUT_CLASS = 'deep-chat-file-input';
  private static readonly EXPORT_BUTTON_CLASS = 'deep-chat-export-button';

  private static enableButtons(dwnload: HTMLButtonElement | undefined, upload: HTMLButtonElement | undefined, rounds = 0) {
    if (window.webLLM) {
      if (dwnload) dwnload.disabled = false;
      if (upload) upload.disabled = false;
    } else if (rounds < WebModel.MODULE_SEARCH_LIMIT_S * 4) {
      setTimeout(() => WebModelIntroMessage.enableButtons(dwnload, upload, rounds + 1), 250);
    }
  }

  // prettier-ignore
  public static setUpInitial(
      init: (files?: FileList) => void, introMessage?: WebModelIntro, chatEl?: HTMLElement, isWorker?: boolean) {
    const downloadClass = introMessage?.downloadClass || WebModelIntroMessage.DOWNLOAD_BUTTON_CLASS;
    const uploadClass = introMessage?.uploadClass || WebModelIntroMessage.UPLOAD_BUTTON_CLASS;
    const fileInputClass = introMessage?.fileInputClass || WebModelIntroMessage.FILE_INPUT_CLASS;
    setTimeout(() => {
      const downloadButton = chatEl?.getElementsByClassName(downloadClass)[0] as HTMLButtonElement;
      const fileInput = chatEl?.getElementsByClassName(fileInputClass)[0] as HTMLInputElement;
      const uploadButton = chatEl?.getElementsByClassName(uploadClass)[0] as HTMLButtonElement;
      if (downloadButton) downloadButton.onclick = () => init();
      if (fileInput) {
        fileInput.onchange = () => {
          if (fileInput.files && fileInput.files.length > 0) init(fileInput.files);
        };
      }
      if (uploadButton) uploadButton.onclick = () => fileInput.click();
      if (downloadButton || uploadButton) WebModelIntroMessage.enableButtons(downloadButton, uploadButton);
    });
    return (
      introMessage?.initialHtml ||
      `<div>
        Download or upload a web model that will run entirely on your browser: <br/> 
        <button disabled class="${downloadClass} deep-chat-button deep-chat-web-model-button">Download</button>
        ${isWorker ? ''
          : `<input type="file" class="${fileInputClass}" hidden multiple />
          <button disabled class="${uploadClass} deep-chat-button deep-chat-web-model-button">Upload</button>`}
      </div>`
    );
  }

  private static exportFile(files: File[]) {
    const a = document.createElement('a');
    const chunkSize = 4;
    // Generating a zip file crashes browser hence exporting in increments
    for (let i = 0; i < files.length / chunkSize; i += 1) {
      setTimeout(() => {
        const start = i * chunkSize;
        for (let y = start; y < Math.min(start + chunkSize, files.length); y += 1) {
          const url = URL.createObjectURL(files[y]);
          a.href = url;
          a.download = files[y].name;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 500 * i);
    }
  }

  // prettier-ignore
  public static setUpAfterLoad(files: File[], introMessage?: WebModelIntro, chatEl?: HTMLElement, isWorker?: boolean) {
    const exportClass = introMessage?.exportFilesClass || WebModelIntroMessage.EXPORT_BUTTON_CLASS;
    setTimeout(() => {
      const exportButton = chatEl?.getElementsByClassName(exportClass)[0] as HTMLButtonElement;
      if (exportButton) exportButton.onclick = () => WebModelIntroMessage.exportFile(files);
    });
    return (
      introMessage?.afterLoadHtml ||
      `<div>
        Model loaded successfully and has been cached for future requests.
        ${isWorker ? ''
          : `<br/> <button style="margin-top: 5px" class="${exportClass} deep-chat-button">Export</button>`}
      </div>`
    );
  }
}
