/**
 * @module DateUtil.mjs
 * Date utilities.
 */

/**
 * Validate a timestamp value expressed as unix timestamp in milliseconds.
 *
 * @param {number|string|null} value - unix timestamp in milliseconds or null
 * @param {boolean} [required] - true if value must not be null (default false)
 * @param {string} [key] - name of the property key containing the timestamp (default 'Value')
 * @returns {number|null} unix timestamp in milliseconds or null
 *
 * @throws {TypeError} if value is not null or number
 */
export function validateTimestamp(value, required = false, key = 'Value') {

    // Reject missing required value
    if (required && value === null) {
        throw new TypeError(`${key} is required`);
    }

    // Allow null values when not required
    if (value === null) return null;

    // Convert string containing only digits
    if (typeof value === 'string') {

        // Reject if string contains anything other than digits
        if (!/^[0-9]+$/.test(value)) {
            throw new TypeError(`${key} must contain digits only rather than: "${value}"`);
        }

        // Convert to number
        value = Number(value);
    }

    // Reject if value is not a number
    else if (typeof value !== 'number') {
        throw new TypeError(`${key} must be a number rather than: "${typeof value}"`);
    }

    // Reject non-finite numbers
    if (!Number.isFinite(value)) {
        throw new TypeError(`${key} must be finite`);
    }

    // Reject non-integer numbers
    if (!Number.isInteger(value)) {
        throw new TypeError(`${key} must be an integer rather than: ${value.toString(10)}`);
    }

    // Return unix timestamp in milliseconds
    return value;
}

/**
 * Format a unix timestamp into a browser‑locale date and time string.
 * 
 * @param {number|null} ms - unix timestamp in milliseconds
 * @returns {string} formatted date and time, or empty string
 */
export function formatDateTime(ms) {

    // Return empty string if no milliseconds
    if (typeof ms !== 'number' || Number.isNaN(ms)) return '';

    // Construct date object from timestamp
    const date = new Date(ms);

    // Format using browser locale with seconds included
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Return an ISO-formatted local timestamp without the trailing Z.
 * 
 * @param {Date} date - the date to convert (default now)
 * @returns {string} ISO local timestamp in YYYY-MM-DDTHH:MM:SS format
 */
export function getLocalIsoTimestamp(date = new Date()) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/**
 * Convert a local-epoch timestamp (i.e. from a datetime-local valueAsNumber)
 * into a true UTC-epoch timestamp.
 *
 * @param {number} ms - local epoch milliseconds
 * @returns {number} UTC epoch milliseconds
 */
export function convertLocalTimestampToUTC(ms) {

    // Compute timezone offset in milliseconds
    const offsetMs = new Date(ms).getTimezoneOffset() * 60000;

    // Return corrected UTC epoch value
    return ms + offsetMs;
}
