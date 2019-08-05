declare module 'autosize-input' {
  interface AutosizeOptions {
    minWidth?: number;
  }

  type CleanupFunction = () => void;

  function autosizeInput(
    input: HTMLInputElement,
    options?: AutosizeOptions
  ): CleanupFunction;

  export = autosizeInput;
}
