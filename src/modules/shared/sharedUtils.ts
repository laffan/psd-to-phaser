/**
 * Shared utilities used across modules.
 *
 * @module shared/sharedUtils
 */

import type { DebugOptions } from '../../types';

/**
 * Merge local and global debug settings into a resolved `DebugOptions` object.
 *
 * Resolution order:
 * 1. Start with defaults (all `false`)
 * 2. Apply global debug settings
 * 3. Apply local overrides (if provided)
 *
 * A boolean `true` enables all three channels; `false` keeps defaults.
 * An object selectively overrides individual channels.
 *
 * @param localDebug - Component-level debug override
 * @param globalDebug - Plugin-wide debug setting from `init()`
 * @returns Fully resolved debug options
 *
 * @internal
 */
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