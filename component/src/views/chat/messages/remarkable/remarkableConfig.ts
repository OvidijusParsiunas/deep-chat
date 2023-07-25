import {Remarkable} from 'remarkable';
import hljs from 'highlight.js';

declare global {
  interface Window {
    hljs: typeof hljs;
  }
}

export class RemarkableConfig {
  public static createNew() {
    const hljsModule = window.hljs;
    if (hljsModule) {
      return new Remarkable({
        highlight: function (str, lang) {
          if (lang && hljsModule.getLanguage(lang)) {
            try {
              return hljsModule.highlight(lang, str).value;
            } catch (err) {
              console.error('failed to setup the highlight dependency');
            }
          }
          try {
            return hljsModule.highlightAuto(str).value;
          } catch (err) {
            console.error('failed to automatically highlight messages');
          }
          return ''; // use external default escaping
        },
        html: false, // Enable HTML tags in source
        xhtmlOut: false, // Use '/' to close single tags (<br />)
        breaks: false, // Convert '\n' in paragraphs into <br>
        langPrefix: 'language-', // CSS language prefix for fenced blocks
        linkTarget: '', // set target to open link in
        typographer: true, // Enable smartypants and other sweet transforms
      });
    } else {
      return new Remarkable();
    }
  }
}
