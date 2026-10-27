/**
 * @module StatusUtil
 * Status file utilities.
 */

/**
 * Properties for an event object.
 *
 * @typedef StatusUtilEventType
 *
 * @property {number|null} startMs - time when event started in milliseconds or null
 * @property {number|null} stopMs - time when event stopped in milliseconds or null
 */

/**
 * Properties for status error object.
 *
 * @typedef StatusUtilErrorType
 *
 * @property {number} attempt - the job queue attempt that caused the error
 * @property {number} timeMs - time when error occurred in milliseconds
 * @property {string} error - the error message
 */

/**
 * Properties for status object.
 *
 * @typedef StatusUtilType
 *
 * @property {StatusUtilEventType} unzip - start and stop times for the unzip event
 * @property {StatusUtilEventType} report - start and stop times for the HTML report generation event
 * @property {StatusUtilEventType} move - start and stop times for the job queue files move event
 * @property {StatusUtilErrorType[]} errors - array of errors
 * @property {number} attempts - number of attempts processing the job
 * @property {number|null} completedMs - time when job complete in milliseconds
 */

/**
 * Calculate number of seconds between an event start and stop
 *
 * @param {StatusUtilEventType} event - the event object
 * @returns {number|null} number of seconds between start and end, otherwise null
 */
export function getEventDuration(event) {

    // Return null if either date missing
    if (!event.startMs || !event.stopMs) return null;

    // Calculate milliseconds difference
    const diffMs = event.stopMs - event.startMs

    // Convert milliseconds to seconds
    const diffSeconds = diffMs / 1000;

    // Return seconds difference
    return diffSeconds;
}