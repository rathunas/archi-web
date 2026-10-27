/**
 * @module WorkerUtil
 * Worker status utilities.
 */

import { WorkerStatus } from '../static/util/WorkerUtil.mjs'; // Worker utilities

// Re-export client side utilities
export * from '../static/util/WorkerUtil.mjs';

/**
 * Determine the current worker status from job metadata and status.json.
 *
 * @param {import('./JobUtil.mjs').WorkerJob|null} worker - active worker job (null if not running)
 * @param {import('./StatusUtil.mjs').StatusUtilType} status - properties in status.json file
 * @returns {import('../static/util/WorkerUtil.mjs').WorkerStatusValue} the worker status
 */
export function getStatus(worker, status) {

    // If completed time recorded, then job is complete
    if (status.completedMs) return WorkerStatus.COMPLETED

    // If worker object exists, then job is active
    if (worker) return WorkerStatus.ACTIVE;

    // If errors, then job failed
    if (status.errors.length > 0) return WorkerStatus.FAILED;

    // If unzip not finished, the job was aborted
    if (status.unzip.startMs && !status.unzip.stopMs) return WorkerStatus.ABORTED;

    // If HTML report generation not finished, the job was aborted
    if (status.report.startMs && !status.report.stopMs) return WorkerStatus.ABORTED;

    // If file move not finished, the job was aborted
    if (status.move.startMs && !status.move.stopMs) return WorkerStatus.ABORTED;

    // Else job has is inactive
    return WorkerStatus.INACTIVE;
}