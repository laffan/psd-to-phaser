import { DebugOptions } from '../../PsdToPhaserPlugin';

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
        // If a debug object is provided, default all options to true unless specifically set to false
        const localOptions: DebugOptions = {
            console: localDebug.console !== false,
            shape: localDebug.shape !== false,
            label: localDebug.label !== false
        };
        return { ...defaultOptions, ...localOptions };
    }

    return defaultOptions;
}
