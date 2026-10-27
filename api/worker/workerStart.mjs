/**
 * @file workerStart
 * API request handler for manually starting a worker job.
 */

import path from 'path'; // Path utilities
import { BadRequestError, InternalError, NotFoundError } from '../../lib/HtmlUtil.mjs';
import { findJob, startWorker } from '../../lib/JobUtil.mjs'; // Job utility
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validateRequestId } from '../../lib/QueueUtil.mjs'; // Queue utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities
import * as StatusUtil from '../../lib/StatusUtil.mjs'; // Status file utility

/**
 * API request and response parameters for manually starting a worker job.
 * @typedef WorkerStartParams
 *
 * @property {string} requestId - the request ID for the worker job
 */

/**
 * API request handler for manually starting a worker job.
 *
 * @param {import('express').Request<WorkerStartParams, WorkerStartParams} req - the express request object
 * @param {import('express').Response<WorkerStartParams} res - the express response object
 */
export function workerStart(req, res) {

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
        throw new NotFoundError(`Worker start rejected - job completed: "${new Date(status.completedMs).toISOString()}"`);
    }

    // Find worker if active
    let worker = findJob(requestId);

    // Reject if worker already running
    if (worker) {
        throw new BadRequestError(`Worker start rejected - worker already running for: "${requestId}"`);
    }

    // Attempt manual worker start
    worker = startWorker(requestId, 'manual');

    // Reject if JobUtil refused
    if (!worker) {
        throw new InternalError(`Worker start failed - JobUtil returned null for: "${requestId}"`);
    }

    // Send response
    return res.json({ requestId });
}