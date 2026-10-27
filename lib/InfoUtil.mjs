/**
 * @module InfoUtil
 * Info file utilities.
 */

import fs from 'fs'; // File system access
import path from 'path'; // Path utilities
import { validateTimestamp } from './DateUtil.mjs';
import { validateArchimateFilename, validatePackageName, validateVersionMs } from './ModelUtil.mjs'; // design model utilities
import { validateRequestId } from './QueueUtil.mjs'; // Queue utilities

// Re-export client side utilities
export * from '../static/util/InfoUtil.mjs';

/**
 * Build full path to info.json for given folder.
 *
 * @param {string} folder - folder containing info.json
 * @returns {string} absolute path to info.json
 */
export function getInfoPath(folder) {

    // Construct full path to info.json inside folder
    return path.join(folder, 'info.json');
}

/**
 * Validate an info.json object.
 *
 * @param {*} obj - the object to validate
 * @returns {import('../static/util/InfoUtil.mjs').InfoUtilType} valid info object
 *
 * @throws {TypeError} if object is not a valid info object
 */
export function validateInfo(obj) {

    // Reject if no object to validate
    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('Instance for info.json must be an object');
    }

    // Validate request ID
    let requestId;
    try { requestId = validateRequestId(obj.requestId); }
    catch (err) { throw new TypeError(`Validation of "requestId" caused error: ${err.message}`); }

    // Validate submitted timestamp
    let submittedMs;
    try { submittedMs = validateTimestamp(obj.submittedMs, true, 'Submitted'); }
    catch (err) { throw new TypeError(`Validation of "submittedMs" caused error: ${err.message}`); }

    // Validate filename
    let filename;
    try { filename = validateArchimateFilename(obj.filename); }
    catch (err) { throw new TypeError(`Validation of "filename" caused error: ${err.message}`); }

    // Validate package name
    let packageName;
    try { packageName = validatePackageName(obj.packageName); }
    catch (err) { throw new TypeError(`Validation of "packageName" caused error: ${err.message}`); }

    // Validate version timestamp
    let versionMs;
    try { versionMs = validateVersionMs(obj.versionMs); }
    catch (err) { throw new TypeError(`Validation of "versionMs" caused error: ${err.message}`); }

    // Return valid info object
    return {
        requestId,
        submittedMs,
        filename,
        packageName,
        versionMs
    };
}

/**
 * Load info.json object from filesystem.
 *
 * @param {string} folder - source folder for info.json file
 * @returns {import('../static/util/InfoUtil.mjs').InfoUtilType} the info object
 *
 * @throws TypeError if info.json is invalid
 * @throws Error if filesystem failed to read info.json
 */
export function load(folder) {

    // Resolve full path to info.json
    const infoPath = getInfoPath(folder);

    // Error if file missing info.json file
    if (!fs.existsSync(infoPath)) {

        // Throw error for missing info.json file
        throw new Error(`Missing info.json in: "${folder}"`);
    }

    // Read info.json file or throw error if failed
    let info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

    // Return validated info object or throw error if invalid
    try { info = validateInfo(info); }
    catch (err) { throw new TypeError(`Validation of info.json in: "${folder}" caused error: ${err.message}`); }

    // Return validated info object
    return info;
}

/**
 * Save an info.json object to filesystem.
 *
 * Creates the file if it does not exist,
 * otherwise overwrites existing file.
 *
 * @param {string} folder - target folder for info.json file
 * @param {import('../static/util/InfoUtil.mjs').InfoUtilType} info - info.json object to write
 * @returns {import('../static/util/InfoUtil.mjs').InfoUtilType} the info.json object
 *
 * @throws Error if filesystem failed to write info.json
 */
export function save(folder, info) {

    // Resolve full path to info.json
    const infoPath = getInfoPath(folder);

    // Write info.json file or throw error if failed
    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));

    // Return info object
    return info;
}