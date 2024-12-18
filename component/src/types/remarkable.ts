// the reason why this is required is because remarkable.d.ts is used as a module and does not expose
// the RemarkableOptions interface to files that don't use the actual Remarkable class
// this become problematic when trying to build the React package
export interface RemarkableOptions {
  xhtmlOut?: boolean;
  html?: boolean;
  breaks?: boolean;
  linkify?: boolean;
  langPrefix?: `language-${string}`;
  linkTarget?: string;
  typographer?: boolean;
  quotes?: string;
  highlight?: (str: string, lang: string) => void;
}
