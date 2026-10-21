export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'markdown'
  | 'yaml'
  | 'sql'
  | 'python'
  | 'graphql'
  | 'xml';

export type ViewMode = 'editor' | 'diff';

export interface PrettierOptions {
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: 'es5' | 'all' | 'none';
  printWidth: number;
  bracketSpacing: boolean;
  arrowParens: 'always' | 'avoid';
}

export interface DiffRow {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}
