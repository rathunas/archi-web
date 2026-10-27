/**
 * @module FileUtil
 * File utilities.
 */

/**
 * Error when a path segment is invalid.
 */
export class InvalidPathSegment extends Error { }

/** Illegal filename characters on Windows platforms. */
const WINDOWS_ILLEGAL_CHARS = /[<>:"\/\\|?*]/;

/** Illegal filename characters on Linux platforms. */
const LINUX_ILLEGAL_CHARS = /\//;

/** Reserved names on Windows platforms. */
const WINDOWS_RESERVED_NAMES = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
];

/** Drive letter pattern on Windows platforms. */
const WINDOWS_DRIVE_LETTER = /^[A-Za-z]:$/;

/** Unicode homoglyph path separators. */
const UNICODE_SEPARATORS = ['／', '＼'];

/** Percent‑encoded slash/backslash patterns. */
const ENCODED_SEPARATORS = /%2F|%5C/i;

/** Control characters (ASCII 0–31). */
const CONTROL_CHARS = /[\u0000-\u001F]/;

/**
 * Path segment validation function.
 * 
 * @callback FileUtilPathSegmentValidator 
 *
 * @param {string} path - the path segment to validate
 * @returns {string} the valid path segment
 *
 * @throws InvalidPathSegment - validation error
 */

/**
 * Validate a single path segment (file or folder name).
 *
 * @param {any} segment - the path segment to validate
 * @param {boolean} allowDriveLetter - allow Windows drive letters (e.g. "C:")
 * @returns {string} the validated and trimmed path segment
 *
 * @throws InvalidPathSegment if segment is not a string or contains invalid characters
 */
export function validatePathSegment(segment, allowDriveLetter = false, segmentName = 'Segment name') {

    // Reject non-string types
    if (typeof segment !== 'string') {
        throw new InvalidPathSegment(`${segmentName} must be a string rather than: "${typeof segment}"`);
    }

    // Trim whitespace
    const trimmed = segment.trim();

    // Reject empty names
    if (trimmed.length === 0) {
        throw new InvalidPathSegment(`${segmentName} must not be empty`);
    }

    // Allow drive letters only when explicitly enabled
    const isDriveLetter = WINDOWS_DRIVE_LETTER.test(trimmed);

    if (isDriveLetter && allowDriveLetter) {
        return trimmed;
    }

    // Reject traversal-like sequences
    if (trimmed.includes('..')) {
        throw new InvalidPathSegment(`${segmentName} must not contain traversal sequences: ${trimmed}`);
    }

    // Reject absolute paths
    if (trimmed.startsWith('/') || WINDOWS_DRIVE_LETTER.test(trimmed)) {
        throw new InvalidPathSegment(`${segmentName} must not be an absolute path: ${trimmed}`);
    }

    // Reject ASCII separators
    if (trimmed.includes('/') || trimmed.includes('\\')) {
        throw new InvalidPathSegment(`${segmentName} must not contain path separators: ${trimmed}`);
    }

    // Reject Unicode homoglyph separators
    for (const sep of UNICODE_SEPARATORS) {
        if (trimmed.includes(sep)) {
            throw new InvalidPathSegment(`${segmentName} must not contain unicode path separators: ${trimmed}`);
        }
    }

    // Reject percent-encoded separators
    if (ENCODED_SEPARATORS.test(trimmed)) {
        throw new InvalidPathSegment(`${segmentName} must not contain encoded path separators: ${trimmed}`);
    }

    // Reject control characters
    if (CONTROL_CHARS.test(trimmed)) {
        throw new InvalidPathSegment(`${segmentName} must not contain control characters`);
    }

    // Reject null bytes explicitly
    if (trimmed.includes('\0')) {
        throw new InvalidPathSegment(`${segmentName} must not contain null bytes`);
    }

    // Reject illegal Windows characters
    if (WINDOWS_ILLEGAL_CHARS.test(trimmed)) {
        throw new InvalidPathSegment(`${segmentName} contains illegal characters: ${trimmed}`);
    }

    // Reject illegal Linux characters
    if (LINUX_ILLEGAL_CHARS.test(trimmed)) {
        throw new InvalidPathSegment(`${segmentName} contains illegal characters: ${trimmed}`);
    }

    // Reject trailing space or period
    if (trimmed.endsWith(' ') || trimmed.endsWith('.')) {
        throw new InvalidPathSegment(`${segmentName} must not end with space or period: ${trimmed}`);
    }

    // Reject Windows reserved device names
    const upper = trimmed.toUpperCase();
    if (WINDOWS_RESERVED_NAMES.includes(upper)) {
        throw new InvalidPathSegment(`${segmentName} must not be a reserved device name: ${trimmed}`);
    }

    // Return validated path segment
    return trimmed;
}

/**
 * Validate a filename.
 *
 * @param {any} filename - the filename to validate
 * @returns {string} the validated and trimmed filename
 *
 * @throws InvalidPathSegment if filename is not a string or contains invalid characters
 */
export function validateFilename(filename) {

    // Validate filename exclude drive letters
    return validatePathSegment(filename, false, 'Filename');
}