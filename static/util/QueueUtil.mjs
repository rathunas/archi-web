/**
 * @module QueueUtil
 * Queue utilities.
 */

/**
 * Queue request status.
 *
 * @typedef QueueRequestStatus
 *
 * @property {import('./WorkerUtil.mjs').WorkerStatusValue} jobStatus - the worker job status
 */

/**
 * Queue request summary.
 * 
 * @typedef { QueueRequestStatus &
 *            import('./InfoUtil.mjs').InfoUtilType
 * } QueueRequestEntry
 */

/**
 * Array of queue request list elements.
 *
 * @typedef QueueRequestListArray
 *
 * @property {QueueRequestEntry[]} requests - array of queue requests
 */

/**
 * Queue request list.
 *
 * @typedef { QueueRequestListArray &
 *            import('./ServerUtil.mjs').ServerConfigWiki
 * } QueueRequestList
 */

/**
 * Queue request detail.
 *
 * @typedef { QueueRequestEntry & 
 *            import('./StatusUtil.mjs').StatusUtilType &
 *            import('./ServerUtil.mjs').ServerConfigWiki
 * } QueueRequestDetail
 */