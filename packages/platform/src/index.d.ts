export declare const isMacOS: boolean;

export declare const isWindows: boolean;

export declare const isOther: boolean;

declare type SelectPlatformFn = {
    <T>(options: {
        macos: T;
        windows: T;
        other: T;
    }): T;
    <T>(options: {
        macos?: T;
        windows?: T;
        other?: T;
        default: T;
    }): T;
};

export declare const selectPlatform: SelectPlatformFn;
