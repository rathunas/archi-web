/**
 * @file workerStop
 * API request handler for manually stoping a worker job.
 */

import path from 'path'; // Path utilities
import { NotFoundError } from '../../lib/HtmlUtil.mjs';
import { findJob, stopWorker } from '../../lib/JobUtil.mjs'; // Job utility
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validateRequestId } from '../../lib/QueueUtil.mjs'; // Queue utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities
import * as StatusUtil from '../../lib/StatusUtil.mjs'; // Status file utility

/**
 * API request and response parameters for manually stoping a worker job.
 * @typedef WorkerStopParams
 *
 * @property {string} requestId - the request ID for the worker job
 */

/**
 * API request handler for manually stopping a worker job.
 *
 * @param {import('express').Request<WorkerStopParams, WorkerStopParams} req - the express request object
 * @param {import('express').Response<WorkerStopParams} res - the express response object
 */
export function workerStop(req, res) {

    // Extract request ID parameter
    let requestId = req.params.requestId;

    // Reject invalid request ID format
    requestId = validateRequestId(requestId);

    // Construct request path
    const requestPath = path.join(config.QUEUE_DIR, requestId);

    // Load status.json file properties
    const status = StatusUtil.load(requestPath, log);

    // Reject if job already completed
    if (status.completedMs) {

        // Log job completed
        throw new NotFoundError(`Worker stop rejected - job completed: "${new Date(status.completedMs).toISOString()}"`);
    }

    // Retrieve active worker job from registry
    const job = findJob(requestId);

    // Reject if no active worker
    if (!job) {
        return log(`Worker stop failed - no active worker for: "${requestId}"`);
    }

    // Stop worker
    stopWorker(job);

    // Send response
    return res.json({ requestId });
}