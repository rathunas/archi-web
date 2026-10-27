/**
 * @module ModelUtil
 * Design model utilities.
 */

import { validateTimestamp } from './DateUtil.mjs'; // Date utilities
import { validateFilename, validatePathSegment } from './FileUtil.mjs'; // File utilities

/**
 * Model package name list entry.
 * 
 * @typedef ModelPackageNameEntry
 * 
 * @property {string} packageName - the model package name
 * @property {number} versions - count of model versions within design package
 */

/**
 * Model package name base detail.
 *
 * @typedef ModelPackageNameBase
 * 
 * @property {string} packageName - the model package name
 * @property {number[]} versions - array of model version timestamps in milliseconds within design package
 */

/**
 * Model package name detail.
 *
 * @typedef { ModelPackageNameBase & 
 *            import('./ServerUtil.mjs').ServerConfigWiki 
 * } ModelPackageNameDetail
 */

/**
 * Model version detail.
 *
 * @typedef { import('./InfoUtil.mjs').InfoUtilType &
 *            import('./StatusUtil.mjs').StatusUtilType &
 *            import('./ServerUtil.mjs').ServerConfigWiki
 * } ModelVersionDetail
 */

/**
 * Validate a package name.
 *
 * A package name must be a valid path segment and must not allow drive letters.
 *
 * @param {any} value - the package name to validate
 * @returns {string} validated package name
 *
 * @throws TypeError if value is not a string
 * @throws RangeError if value is empty or contains invalid characters
 */
export function validatePackageName(value) {

    // Validate as a path segment without drive letters
    return validatePathSegment(value, false, 'Package name');
}

/**
 * Validate version timestamp value as seconds past unix epoch.
 * 
 * @param {any} value - version timestamp in milliseconds
 * @returns {number} positive integer timestamp in milliseconds
 * 
 * @throws TypeError if version is not numeric
 * @throws RangeError if version is not a positive integer
 */
export function validateVersionMs(value) {

    // Validate version as timestamp
    value = validateTimestamp(value, true, 'Version');

    // Reject non-positive integers
    if (value <= 0) {
        throw new RangeError(`Version must be a positive integer rather than: "${value.toString(10)}"`);
    }

    // Return validated positive integer
    return value;
}

/**
 * Validate an Archimate model filename.
 *
 * Ensures the value is a valid path segment and that it ends with
 * the required ".archimate" extension.
 *
 * @param {any} value - filename to validate
 * @returns {string} validated filename
 *
 * @throws {TypeError} if value is not a string
 * @throws {RangeError} if value is empty or contains invalid characters
 * @throws {TypeError} if filename does not end with ".archimate"
 */
export function validateArchimateFilename(value) {

    // Validate filename
    const filename = validateFilename(value);

    // Reject if filename does not end in .archimate
    if (!filename.toLowerCase().endsWith('.archimate')) {
        throw new TypeError(`Filename must end in ".archimate" instead of: "${filename}"`);
    }

    // Return validated filename
    return filename;
}

/**
 * Validate model deign package name client-side input using custom logic and browser-native bubbles.
 *
 * @param {HTMLInputElement} input - the design package name input element
 * @returns {boolean} true if valid, else false
 */
export function validatePackageNameInput(input) {

    // Read trimmed design package name
    const name = input.value.trim();

    // Validate design package name using custom logic
    try {

        // Run custom design package name validator
        validatePackageName(name);

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