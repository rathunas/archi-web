/**
 * @file queueSubmit
 * API request handler to submit a job queue request.
 */

import { randomUUID } from 'crypto'; // Crypto utilities
import fs from 'fs'; // File system access
import path from 'path'; // Path utilities
import { BadRequestError } from '../../lib/HtmlUtil.mjs'; // HTML utilities
import * as InfoUtil from '../../lib/InfoUtil.mjs'; // Info file utilities
import { startWorker } from '../../lib/JobUtil.mjs'; // Job utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validateArchimateFilename, validatePackageName, validateVersionMs } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities
import * as StatusUtil from '../../lib/StatusUtil.mjs'; // Stat file utilities

/**
 * API request body to submit a job queue request.
 * @typedef QueueSubmitRequestBody
 *
 * @property {File} file - archimate model file to process
 * @property {string} packageName - the design package name for the model
 * @property {number} versionMs - the version timestamp in milliseconds
 */

/**
 * API response from submit a job queue request.
 * @typedef QueueSubmitResponse
 * 
 * @property {string} requestId - the job queue request ID
 */

/**
 * API request handler to submit a job queue request.
 *
 * @param {import('express').Request<{}, QueueSubmitResponse, QueueSubmitRequestBody>} req - the express request object
 * @param {import('express').Response<QueueSubmitResponse>} res - the express response object
 */
export function queueSubmitApi(req, res) {

    // The uploaded file
    const file = req.file;

    // Reject if no file provided
    if (!file) throw new BadRequestError('No file provided');

    // Extract original uploaded filename
    let originalName = req.file.originalname;

    // Reject invalid filename
    originalName = validateArchimateFilename(originalName);

    // Extract package name and version timestamp
    let { packageName, versionMs } = req.body;

    // Reject invalid package name
    packageName = validatePackageName(packageName);

    // Reject if invalid version
    versionMs = validateVersionMs(versionMs);

    // Generate queue job request ID for this upload
    const requestId = randomUUID();

    // Construct request folder path
    const requestPath = path.join(config.QUEUE_DIR, requestId);

    // Create request folder or reject if filesystem error
    fs.mkdirSync(requestPath, { recursive: true });

    // Construct saved filename
    const savedFilename = `${versionMs.toString(10)}.archimate`;

    // Construct file path
    const filePath = path.join(requestPath, savedFilename);

    // Save uploaded file to job request folder or reject if filesystem error
    fs.writeFileSync(filePath, req.file.buffer);

    /** Info object @type {InfoUtil.InfoUtilType} */
    let info = {
        requestId,
        submittedMs: Date.now(),
        filename: originalName,
        packageName,
        versionMs
    };

    // Save info.json file or reject if file system error
    info = InfoUtil.save(requestPath, info);

    // Save default status.json file or reject if file systen error
    StatusUtil.save(requestPath, StatusUtil.defaultStatus);

    // Log success
    log(`Successfully uploaded job queue request: "${requestId}"`, req);

    // Kick off worker to process this queue item
    const job = startWorker(requestId, 'auto');

    // Log worker start or rejection
    if (job) log(`Upload router auto started worker for: "${requestId}"`, req);
    else log(`Upload router worker error for: "${requestId}"`, req);

    // Send success response
    return res.json({ request: requestId });
}