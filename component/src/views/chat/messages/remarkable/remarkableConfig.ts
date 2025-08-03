import {RemarkableOptions} from '../../../../types/remarkable';
import {KatexPlugin} from './katexPlugin';
import {Remarkable} from 'remarkable';
import hljs from 'highlight.js';

declare global {
  interface Window {
    hljs: typeof hljs;
    remarkable_plugins: {plugin: unknown; options?: unknown}[];
    katex: {
      renderToString: (source: string, options?: {displayMode: boolean; throwOnError: boolean; output: string}) => string;
    };
  }
}

export class RemarkableConfig {
  private static readonly DEFAULT_PROPERTIES = {
    breaks: true,
    linkTarget: '_blank', // set target to open in a new tab
  };

  private static addPlugins(remarkable: Remarkable, customConfig?: RemarkableOptions) {
    const plugins = window.remarkable_plugins;
    if (plugins) {
      plugins.forEach((plugin) => {
        remarkable.use(plugin.plugin, plugin.options);
      });
    }
    if (customConfig?.math) {
      if (!window.katex) {
        // WORK - link to the documentation
        console.warn('window.katex not found, use chatElementRef.refreshMessages to re-render messages');
      }
      const delimiter = typeof customConfig.math === 'object' ? customConfig.math.delimiter : '';
      const options = typeof customConfig.math === 'object' && customConfig.math.options ? customConfig.math.options : {};
      remarkable.use(KatexPlugin.katex.bind(this, options), {delimiter});
    }
  }

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
    RemarkableConfig.addPlugins(remarkable, customConfig);
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
