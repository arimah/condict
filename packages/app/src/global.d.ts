declare interface Navigator {
  readonly keyboard: Keyboard;
}

declare interface Keyboard {
  getLayoutMap(): Promise<KeyboardLayoutMap>;
  lock(keyCodes?: string[]): Promise<void>;
  unlock(): void;
}

declare interface KeyboardLayoutMap {
  readonly size: number;
  keys(): Iterator<string>;
  values(): Iterator<string>;
  entries(): Iterator<[string, string]>;
  has(key: string): boolean;
  get(key: string): string | undefined;
  forEach(
    callbackfn: (value: string, key: string, map: KeyboardLayoutMap) => void,
    thisArg?: any
  ): void;
}
