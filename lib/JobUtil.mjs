/**
 * @module JobUtil
 * Job queue utilities.
 */

import path from 'path'; // Path utilities
import { fileURLToPath } from 'url'; // ES-module dirname support
import { Worker } from 'worker_threads'; // Worker thread support
import { log } from './LogUtil.mjs'; // Logging utility
import { config } from './ServerUtil.mjs'; // Server utility

// ------------------------------------------------------------
// ES‑module __dirname replacement
// ------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Worker job object.
 *
 * @typedef {Object} WorkerJob
 *
 * @property {Worker} worker - worker thread instance
 * @property {string} requestId - job queue request ID
 * @property {string} trigger - auto or manual trigger source
 * @property {number} startedMs - worker start timestamp in milliseconds
 */

/**
 * Active worker registry.
 *
 * @type {Map<string, WorkerJob>}
 * Maps request ID -> WorkerJob
 */
const activeJobs = new Map();

/**
 * Find active worker job for a request ID.
 *
 * @param {string} requestId - job queue request ID
 * @returns {WorkerJob|null} active job or null
 */
export function findJob(requestId) {

    // Return active job with matching request ID or null
    return activeJobs.get(requestId) || null;
}

/**
 * Create a WorkerJob object.
 * Wraps the worker thread instance with metadata used by the server.
 *
 * @param {Worker} worker - worker thread instance
 * @param {string} requestId - request ID for job
 * @param {string} trigger - "auto" or "manual"
 * @returns {WorkerJob}
 */
export function createWorkerJob(worker, requestId, trigger) {

    // Build job metadata object for tracking lifecycle and status
    return {
        worker,
        requestId,
        trigger,
        startedMs: Date.now()
    };
}

/**
 * Start a worker for a specific request ID.
 * Creates a worker thread, registers lifecycle handlers, and updates status.json.
 *
 * @param {string} requestId - request ID for job
 * @param {string} trigger - "auto" or "manual"
 * @returns {WorkerJob}
 */
export function startWorker(requestId, trigger) {

    // Path to worker thread script
    const workerPath = path.join(__dirname, 'WorkerThread.mjs');

    // Create worker thread with job metadata and server config
    const worker = new Worker(workerPath, {

        // WorkerData passed into workerThread.js for processing
        workerData: {
            job: {
                requestId,
                trigger
            },
            config
        }
    });

    // Wrap worker in job object
    const job = createWorkerJob(worker, requestId, trigger);

    // Store in registry
    activeJobs.set(requestId, job);

    // Log job started
    log(`Job started for: "${requestId}" trigger: ${trigger}`, null);

    // Worker message handler
    worker.on('message', (msg, obj) => {

        // Log worker message
        if (msg.log) {
            return log(msg.log, obj);
        }

        // Log worker success
        if (msg.ok) {
            return log(`Job completed for: "${requestId}"`, null);
        }

        // Log job failure
        log(`Job failure for :"${requestId}" error: ${msg.error}`, null);
    });

    // Worker error handler
    worker.on('error', (err) => {
        log(`Job error for: "${requestId}" error: ${err.message}`, null);
    });

    // Worker exit handler
    worker.on('exit', (code) => {

        // Remove job from registry
        activeJobs.delete(requestId);

        // Log job exit
        log(`Job exited for: "${requestId}" with code: ${code}`, null);
    });

    // Return worker job
    return job;
}

/**
 * Stop a worker immediately.
 * Terminates the thread.
 *
 * @param {WorkerJob} job - active worker job
 * @param {import('./LogUtil.mjs').LoggerMap} log - logging functions
 */
export function stopWorker(job, log) {

    // Attempt to terminate worker thread gracefully
    try {
        job.worker.terminate();

    } catch (err) {
        log(`Error terminating job for: "${job.requestId}" error: ${err.message}`, null);
    }

    // Remove from registry
    activeJobs.delete(job.requestId);

    // Log worker stop event
    log(`Job stopped for: "${job.requestId}"`, null);
}