/**
 * @file queueList
 * API request handler for returning list of job queue requests.
 */

import path from 'path'; // Path utilities
import { list } from '../../lib/FileUtil.mjs'; // File utilities
import { load as loadInfo } from '../../lib/InfoUtil.mjs'; // Info file utilities
import { findJob } from '../../lib/JobUtil.mjs'; // Job utilities
import { isRequestId } from '../../lib/QueueUtil.mjs'; // Queue utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities
import { load as loadStatus } from '../../lib/StatusUtil.mjs'; // Status file utilities
import { getStatus } from '../../lib/WorkerUtil.mjs';

/**
 * Transform a file system metadata entry into a job queue request entry.
 * 
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - file system metadata entry
 * @returns {import('../../lib/QueueUtil.mjs').QueueRequestEntry} the job queue request
 */
function toRequest(entry) {

    // Folder name is job queue request Id
    const requestId = entry.name;

    // Construct request path
    const requestPath = path.join(config.QUEUE_DIR, requestId);

    // Load info and status
    const info = loadInfo(requestPath);
    const status = loadStatus(requestPath);

    // Find worker job if running
    const workerJob = findJob(requestId);

    // Get job status
    const jobStatus = getStatus(workerJob, status);

    // Return job queue request entry
    return {
        ...info,
        jobStatus
    };
}

/**
 * Return queue list data.
 *
 * @returns {import('../../static/util/QueueUtil.mjs').QueueRequestList} queue list data
 */
export function queueListData() {

    // Fetch queue requests
    const requests = list({
        dir: config.QUEUE_DIR,
        filter: isRequestId,
        transform: toRequest
    });

    // Return queue list data
    return {
        wiki: config.WIKI,
        requests
    }
}

/**
 * API request handler for returning list of job queue requests.
 *
 * @param {import('express').Request<{},import('../../lib/QueueUtil.mjs').QueueRequestList>} req - the express request object
 * @param {import('express').Response<import('../../lib/QueueUtil.mjs').QueueRequestList>} res - the express response object
 */
export function queueListApi(req, res) {

    // Get queue list data
    const data = queueListData();

    // Send response
    res.json(data);
}