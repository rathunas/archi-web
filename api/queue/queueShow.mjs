/**
 * @file queueShow
 * API request handler for fetching the details of a job queue request.
 */

import fs from 'fs'; // File system utilities
import path from 'path'; // Path utilities
import { HTML_NOT_FOUND } from '../../lib/HtmlUtil.mjs'; // HTML utilities
import { load as loadInfo } from '../../lib/InfoUtil.mjs'; // Info file utilities
import { findJob } from '../../lib/JobUtil.mjs'; // Job utilities
import { validateRequestId } from '../../lib/QueueUtil.mjs'; // Queue utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities
import { load as loadStatus } from '../../lib/StatusUtil.mjs'; // Status file utilities
import { getStatus } from '../../lib/WorkerUtil.mjs'; // Worker utilities

/**
 * API request parameters for fetching the details a job queue request.
 * @typedef QueueShowRequestParams
 *
 * @property {string} requestId - the request ID to fetch
 */

/**
 * Return queue data.
 *
 * @param {string} requestId - the request ID to fetch
 * @returns {import('../../static/util/QueueUtil.mjs').QueueRequestDetail|null} queue data or null if request ID does not exist
 */
export function queueShowData(requestId) {

    // Reject invalid request ID format
    requestId = validateRequestId(requestId);

    // Construct request path
    const requestPath = path.join(config.QUEUE_DIR, requestId);

    /** File system entry statistics @type fs.Stats */
    let entry;
    try { entry = fs.statSync(requestPath); }
    catch (err) { return null; }

    // Load info and status
    const info = loadInfo(requestPath);
    const status = loadStatus(requestPath);

    // Find worker job if running
    const workerJob = findJob(requestId);

    // Get job status
    const jobStatus = getStatus(workerJob, status);

    /** Job queue detail.  */
    return {
        ...info,
        ...status,
        ctimeMs: entry.ctimeMs,
        jobStatus,
        wiki: config.WIKI
    };
}

/**
 * API request handler for fetching the details a job queue request.
 *
 * @param {import('express').Request<QueueShowRequestParams, import('../../lib/QueueUtil.mjs').QueueRequestDetail>} req - the express request object
 * @param {import('express').Response<import('../../lib/QueueUtil.mjs').QueueRequestDetail>} res - the express response object
 */
export function queueShowApi(req, res) {

    // Extract request ID parameter
    let requestId = req.params.requestId;

    // Fetch queue data
    const data = queueShowData(requestId);

    // Send response
    if (data) res.json(data);

    // Else request ID notfound
    return res.status(HTML_NOT_FOUND).send();
}