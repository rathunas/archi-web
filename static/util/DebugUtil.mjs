/**
 * @module DebugUtil
 * Debug file utilities.
 */

import { validateFilename } from './FileUtil.mjs'; // File utilities

/**
 * Debug file system entry.
 * 
 * @typedef DebugFileSystemEntry
 * 
 * @property {string} filename - the debug filename
 * @property {number} mtimeMs - file last modification time in milliseconds
 * @property {number} size - file size in bytes
 */

/**
 * Validate a debug filename using client-side custom logic and browser-native bubbles.
 *
 * @param {HTMLInputElement} input - the filename input element
 * @returns {boolean} true if valid, else false
 */
export function validateDebugFilenameInput(input) {

    // Read trimmed filename
    const name = input.value.trim();

    // Validate filename using custom logic
    try {

        // Run custom filename validator
        validateFilename(name);

        // Clear browser validation error
        input.setCustomValidity('');

    } catch (err) {

        // Feed custom error into browser bubble
        input.setCustomValidity(err.message);

        // Show bubble immediately
        input.reportValidity();

        // Invalid
        return false;
    }

    // All valid
    return true;
}