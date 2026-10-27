/**
 * @module QueueUtil
 * queue utilities.
 */

// Re-export client side utilities
export * from '../static/util/QueueUtil.mjs';

// UUID v4 format (lowercase hex)
const UUIDV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * Validate a queue request ID.
 *
 * A queue request ID must be a valid UUID v4 string.
 *
 * @param {any} value - the queue request ID to validate
 * @returns {string} validated queue request ID
 *
 * @throws TypeError if value is not a string
 * @throws RangeError if value is empty or contains invalid characters
 */
export function validateRequestId(value) {

    // Must be a string
    if (typeof value !== 'string') {
        throw new TypeError('Queue request ID must be a string');
    }

    // Trim whitespace
    const trimmed = value.trim();

    // Must not be empty
    if (trimmed.length === 0) {
        throw new RangeError('Queue request ID must not be empty');
    }

    // Must match UUID v4 format
    if (!UUIDV4.test(trimmed)) {
        throw new RangeError(`Queue request ID: "${value}" is not a valid UUID v4`);
    }

    // Return validated request ID
    return trimmed;
}

/**
 * Determine if a filesystem entry is a directory with UUIDv4 name format.
 *
 * @param {import('./FileUtil.mjs').FileSystemEntry} entry - the filesystem entry metadata
 * @returns {boolean} true if the entry is a directory with UUIDv4 name format, otherwise false
 */
export function isRequestId(entry) {

    // Return true if entry is a directory with UUIDv4 name format
    return (entry.isDirectory & UUIDV4.test(entry.name));
}