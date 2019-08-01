declare class HtmlReplaceWebpackPlugin {
  constructor(patterns: HtmlReplaceWebpackPlugin.ReplacePatterns);

  apply(compiler: any): void;
}

declare namespace HtmlReplaceWebpackPlugin {
  type ReplacePatterns = ReplacePattern[] | ReplacePattern;

  interface ReplacePattern {
    pattern: string | RegExp;
    replacement: string | ReplaceFunction;
  }

  type ReplaceFunction = (match: string, ...groups: string[]) => string;
}

declare module 'html-replace-webpack-plugin';
