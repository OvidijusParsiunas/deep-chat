// this is rquired because the @types/remarkable package is throwing linting errors

declare module 'remarkable' {
  export class Remarkable {
    constructor(options?: RemarkableOptions);
    public render: (markdown: string) => string;
    public inline: {validateLink: () => boolean};
  }

  export interface RemarkableOptions {
    xhtmlOut?: boolean;
    html?: boolean;
    breaks?: boolean;
    linkify?: boolean;
    langPrefix?: string;
    linkTarget?: string;
    typographer?: boolean;
    quotes?: string;
    highlight?: (str: string, lang: string) => void;
  }
}
