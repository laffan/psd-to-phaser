import { DebugOptions } from '../../PsdToPhaser';

export function getDebugOptions(localDebug: boolean | DebugOptions | undefined, globalDebug: boolean | DebugOptions): DebugOptions {
    const defaultOptions: DebugOptions = { console: false, shape: false, label: false };

    // Apply global debug settings
    if (typeof globalDebug === 'boolean') {
        defaultOptions.console = globalDebug;
        defaultOptions.shape = globalDebug;
        defaultOptions.label = globalDebug;
    } else if (typeof globalDebug === 'object') {
        Object.assign(defaultOptions, globalDebug);
    }

    // Apply local debug settings
    if (typeof localDebug === 'boolean') {
        return localDebug ? { console: true, shape: true, label: true } : defaultOptions;
    } else if (typeof localDebug === 'object') {
        // Only override the options that are explicitly set in localDebug
        return {
            console: localDebug.console !== undefined ? localDebug.console : defaultOptions.console,
            shape: localDebug.shape !== undefined ? localDebug.shape : defaultOptions.shape,
            label: localDebug.label !== undefined ? localDebug.label : defaultOptions.label
        };
    }

    return defaultOptions;
}