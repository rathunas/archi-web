/**
 * @module StatusUtil
 * Status file utilities.
 */

import fs from 'fs'; // File system access
import path from 'path'; // Path utilities
import { validateTimestamp } from './DateUtil.mjs';

// Re-export client side utilities
export * from '../static/util/StatusUtil.mjs';

/**
 * Build full path to status.json for given folder.
 *
 * @param {string} folder - folder containing status.json
 * @returns {string} absolute path to status.json
 */
export function getStatusPath(folder) {

    // Construct full path to status.json inside folder
    return path.join(folder, 'status.json');
}

/**
 * Load an event object.
 *
 * @param {any} obj - the event object
 * @param {string} key - property name
 * @returns {import('../static/util/StatusUtil.mjs').StatusUtilEventType} validated event object
 *
 * @throws TypeError if not a valid event object
 */
function loadEvent(obj, key) {

    // Reject if no event object to validate
    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError(`Event for "${key}" must be an object`);
    }

    // Validate event start timestamp
    let startMs;
    try { startMs = validateTimestamp(obj.startMs); }
    catch (err) { throw new TypeError(`Validation of "startMs" timestamp for event "${key}" caused error: ${err.message}`); }

    // Validate event stop timestamp
    let stopMs;
    try { stopMs = validateTimestamp(obj.stopMs); }
    catch (err) { throw new TypeError(`Validation of "stopMs" timestamp for event "${key}" caused error: ${err.message}`); }

    // Reject if stop without start
    if (stopMs !== null && startMs === null) {
        throw new TypeError(`Event for "${key}" has stop timestamp without start`);
    }

    // Reject if stop before start
    if (stopMs !== null && startMs !== null && stopMs < startMs) {
        throw new TypeError(`Event for "${key}" has stop timestamp before start`);
    }

    // Return validated timestamps
    return {
        startMs,
        stopMs
    };
}

/**
 * Validate array of error records.
 *
 * @param {any} obj - the array of error records 
 * @param {string} key - property name
 * @param {number} attempts - maximum number of job processing attempts so far
 * @returns {import('../static/util/StatusUtil.mjs').StatusUtilErrorType[]} validated array of error records
 *
 * @throws TypeError if not a valid array of error records
 */
function validateErrorRecords(obj, key, attempts) {

    // Reject if obj is not an array
    if (!Array.isArray(obj)) {
        throw new TypeError(`Value of "${key}" must be an array`);
    }

    /** Array of validated error records. @type {StatusUtilErrorType[]} */
    const validated = [];

    // Loop through array elements
    obj.forEach((record, index) => {

        // Reject if no error object to validate
        if (typeof record !== 'object' || record === null) {
            throw new TypeError(`Error record for "${key}[${index}]" must be an object`);
        }

        // Validate attempt value
        const attempt = record.attempt;
        if (typeof attempt !== 'number' || !Number.isInteger(attempt) || attempt < 0 || attempt > attempts) {
            throw new TypeError(`Value of "${key}[${index}].attempt" must be a non-negative integer less than or equal to ${attempts}`);
        }

        // Validate error timestamp value
        let timeMs;
        try { timeMs = validateTimestamp(record.timeMs, true); }
        catch (err) { throw new TypeError(`Validation of "timeMs" in error record for "${key}[${index}]" caused error: ${err.message}`); }

        // Validate error message type
        const error = record.error;
        if (typeof error !== 'string') {
            throw new TypeError(`Value of "${key}[${index}].error" must be a string`);
        }

        // Append validated error record
        validated.push({
            attempt,
            timeMs,
            error
        });
    });

    // Return array of validated error records
    return validated;
}

/**
 * Check if object is a valid status object.
 *
 * @param {any} obj - the object to validate
 * @returns {import('../static/util/StatusUtil.mjs').StatusUtilType} valid status object
 *
 * @throws TypeError if object is not a valid status object
 */
export function validateStatus(obj) {

    // Reject if no object to validate
    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('Instance for status.json must be an object');
    }

    // Validate events
    const unzip = loadEvent(obj.unzip, 'unzip');
    const report = loadEvent(obj.report, 'report');
    const move = loadEvent(obj.move, 'move');

    // Validate attempts type
    const attempts = obj.attempts;
    if (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 0) {
        throw new TypeError(`Value of "attempts" must be a non-negative integer`);
    }

    // Validate array of error records
    const errors = validateErrorRecords(obj.errors, 'errors', attempts);

    // Validate completed timestamp
    let completedMs;
    try { completedMs = validateTimestamp(obj.completedMs); }
    catch (err) { throw new TypeError(`Validation of "completedMs" caused error: ${err.message}`); }

    // Return valid status object
    return {
        unzip,
        report,
        move,
        attempts,
        errors,
        completedMs
    };
}

/**
 * Load status object from filesystem.
 *
 * @param {string} folder - source folder for status.json file
 * @returns {import('../static/util/StatusUtil.mjs').StatusUtilType} the status object
 *
 * @throws TypeError if status.json is invalid
 * @throws Error if filesystem failed to read status.json
 */
export function load(folder) {

    // Resolve full path to status.json
    const statusPath = getStatusPath(folder);

    // Error if file missing status.json file
    if (!fs.existsSync(statusPath)) {

        // Throw error for missing status.json file
        throw new Error(`Missing status.json in: "${folder}"`);
    }

    // Read status.json file or throw error if failed
    let status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));

    // Return validated status object or throw error if invalid
    try { status = validateStatus(status); }
    catch (err) { throw new TypeError(`Validation of status.json in: "${folder}" caused error: ${err.message}`); }

    // Return validated status
    return status;
}

/**
 * Save a status.json object to filesystem.
 *
 * Creates the file if it does not exist,
 * otherwise overwrites existing file.
 *
 * @param {string} folder - target folder for status.json file
 * @param {import('../static/util/StatusUtil.mjs').StatusUtilType} status - status.json object to write
 * @returns {import('../static/util/StatusUtil.mjs').StatusUtilType} the status.json object
 *
 * @throws Error if filesystem failed to write status.json
 */
export function save(folder, status) {

    // Resolve full path to status.json
    const statusPath = getStatusPath(folder);

    // Write status.json file or throw error if failed
    fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));

    // Return status object
    return status;
}

/**
 * Default status object.
 * @type import('../static/util/StatusUtil.mjs').StatusUtilType
 */
export const defaultStatus = {
    unzip: { startMs: null, stopMs: null },
    report: { startMs: null, stopMs: null },
    move: { startMs: null, stopMs: null },
    attempts: 0,
    errors: [],
    completedMs: null
};