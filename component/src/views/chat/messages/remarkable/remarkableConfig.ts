import {RemarkableOptions} from '../../../../types/remarkable';
import {Remarkable} from 'remarkable';
import hljs from 'highlight.js';

declare global {
  interface Window {
    hljs: typeof hljs;
  }
}

export class RemarkableConfig {
  private static readonly DEFAULT_PROPERTIES = {
    breaks: true,
    linkTarget: '_blank', // set target to open in a new tab
  };

  private static instantiate(customConfig?: RemarkableOptions) {
    if (customConfig) {
      return new Remarkable({...RemarkableConfig.DEFAULT_PROPERTIES, ...customConfig});
    } else if (window.hljs) {
      const hljsModule = window.hljs;
      return new Remarkable({
        highlight: function (str, language) {
          if (language && hljsModule.getLanguage(language)) {
            try {
              return hljsModule.highlight(str, {language}).value;
            } catch (_) {
              console.error('failed to setup the highlight dependency');
            }
          }
          try {
            return hljsModule.highlightAuto(str).value;
          } catch (_) {
            console.error('failed to automatically highlight messages');
          }
          return ''; // use external default escaping
        },
        html: false, // Enable HTML tags in source
        xhtmlOut: false, // Use '/' to close single tags (<br />)
        breaks: true, // Convert '\n' in paragraphs into <br>
        langPrefix: 'language-', // CSS language prefix for fenced blocks
        linkTarget: '_blank', // set target to open in a new tab
        typographer: true, // Enable smartypants and other sweet transforms
      });
    } else {
      return new Remarkable(RemarkableConfig.DEFAULT_PROPERTIES);
    }
  }

  public static createNew(customConfig?: RemarkableOptions) {
    const remarkable = RemarkableConfig.instantiate(customConfig);
    remarkable.inline.validateLink = () => true;
    return remarkable;
  }
}

// The following are examples of how to use other MarkDown to HTML converters

// https://github.com/rehypejs/rehype-sanitize?tab=readme-ov-file#use
// import {unified} from 'unified';
// import rehypeSanitize from 'rehype-sanitize';
// import rehypeStringify from 'rehype-stringify';
// import remarkParse from 'remark-parse';
// import remarkRehype from 'remark-rehype';
// import markdownit from 'markdown-it';

// const result = await unified()
//   .use(remarkParse)
//   .use(remarkRehype)
//   .use(rehypeSanitize)
//   .use(rehypeStringify)
//   .process('# Hello, Neptune!');
// }

// https://github.com/markdown-it/markdown-it?tab=readme-ov-file#usage-examples
// const md = markdownit();
// md.renderInline('__markdown-it__ rulezz!');
