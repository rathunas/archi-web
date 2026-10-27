/**
 * @module WorkerThread
 * Worker thread module.
 */

import { execFile } from 'child_process';
import { unzipSync } from 'fflate';
import fs from 'fs';
import path from 'path';
import { parentPort, workerData } from 'worker_threads';
import * as InfoUtil from './InfoUtil.mjs';
import * as StatusUtil from './StatusUtil.mjs';

/**
 * Emit structured log message to JobUtil.
 *
 * @param {string} msg - worker log message
 * @param {object} [obj] - optional diagnostic object
 */
function log(msg, obj) {

    // Send message
    parentPort.postMessage({ log: msg, obj });
}

/**
 * Worker thread success return object.
 * 
 * @typedef WorkerThreadSuccess
 * 
 * @property {true} ok - indicates worker thread success
 */

/**
 * Worker thread error return object.
 * 
 * @typedef WorkerThreadError
 * 
 * @property {false} ok - indicates worker thread error
 * @property {string} error - the error message
 * @property {object} [details] - additional details
 */

/**
 * Capture filesystem error when loading or saving info.json or status.json files.
 * 
 * @param {'load'|'save'} action - the action type
 * @param {'info'|'status'} file - the filename without .json suffix
 * @param {string} path - the folder containing the file
 * @param {Error} err - the Error object
 * @returns {WorkerThreadError}
 */
function fileSystemError(action, file, path, err) {

    // Return error object
    return {
        ok: false,
        error: `Attempt to ${action} ${file}.json in: "${path}" caused error: ${err.message}`,
        details: { path }
    };
}

/**
 * Detect whether a buffer represents a ZIP archive.
 *
 * @param {Uint8Array} buffer - binary data to inspect
 * @returns {boolean} true if buffer begins with ZIP signature
 */
function isZip(buffer) {

    // ZIP local file header signature: 0x50 0x4B 0x03 0x04
    return buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4B &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04;
}

/**
 * Perform job processing step to unzip archimate file.
 *
 * @param {StatusUtil.StatusUtilType} status - the status.json object
 * @param {string} requestPath - the job queue request path
 * @param {string} filename - the archimate zip file
 * @param {string} extractPath - the folder to extract zip file into
 * @returns {WorkerThreadSuccess | WorkerThreadError} job success or failure indicator
 */
function processJobStep1(status, requestPath, filename, extractPath) {

    // Unzip archimate file if not already done
    if (status.unzip.stopMs === null) {

        // Log start attempt
        log(`Worker thread attempting unzip: "${filename}"`);

        // Mark unzip start time in status object
        status.unzip.startMs = Date.now();

        // Save updated status.json or reject if filesystem error
        try { status = StatusUtil.save(requestPath, status); }
        catch (err) { return fileSystemError('save', 'status', requestPath, err); }

        // Attempt to unzip archimate file in job queue request folder
        try {

            // Create the unzip folder
            fs.mkdirSync(extractPath, { recursive: true });

            // Read file into buffer
            const zipBuffer = fs.readFileSync(filename);

            // Check if file is actually a ZIP archive
            if (isZip(zipBuffer)) {

                // Log detection
                log(`Worker thread detected ZIP archive: "${filename}"`);

                // Unzip archive
                const files = unzipSync(zipBuffer);

                // Loop through metadata
                for (const [innerName, data] of Object.entries(files)) {

                    // Create output path for the zipped file
                    const outPath = path.join(extractPath, innerName);
                    fs.mkdirSync(path.dirname(outPath), { recursive: true });

                    // Write file contents
                    fs.writeFileSync(outPath, data);
                }

            } else {

                // Log detection
                log(`Worker thread detected normal file: "${filename}"`);

                // Copy the XML file into extractPath as model.xml
                const outPath = path.join(extractPath, 'model.xml');
                fs.writeFileSync(outPath, zipBuffer);
            }

            // Mark unzip stop time in status object
            status.unzip.stopMs = Date.now();

            // Save updated status.json or reject if filesystem error
            try { status = StatusUtil.save(requestPath, status); }
            catch (err) { return fileSystemError('save', 'status', requestPath, err); }

            // Log success
            log(`Worker thread successfully processed step 1 for: "${filename}"`);
        }

        // Catch failure to unzip archimate file
        catch (err) {

            // Record error in status object
            status.errors.push({
                timeMs: Date.now(),
                attempt: status.attempts,
                error: `Unzip failed: ${err.message}`
            });

            // Save updated status.json or reject if filesystem error
            try { status = StatusUtil.save(requestPath, status); }
            catch (err) { return fileSystemError('save', 'status', requestPath, err); }

            // Log failure
            log(`Worker thread unzip failed for: "${filename}" error: ${err.message}`, { stack: err.stack });

            // Return error object
            return {
                ok: false,
                error: 'Unzip failed',
                details: { message: err.message, stack: err.stack, sourceZipFilename: filename }
            };
        }
    }

    // Return success
    return { ok: true };
}

/**
 * Worker thread execution output object.
 * 
 * @typedef WorkerThreadExecResult
 *  
 * @property {import('child_process').ExecFileException|null} err - the error message from the executed command
 * @property {string} stdout - the standard output from the executed command
 * @property {string} stderr - the standard error from the executed command
 */

/**
 * Remove known benign warning lines from an Archi stderr message.
 *
 * @param {string} message - the message to filter
 * @returns {string} filtered message
 */
function removeWarnings(message) {

    // Known benign stderr patterns emitted by the Archi HTML report generator
    const ignoredPatterns = [
        'WARNING:',
        'no such template: /IGNORE_ERROR_'
    ];

    // Remove ignored lines and trim whitespace
    return message
        .split(/\r?\n/)
        .filter(line =>
            !ignoredPatterns.some(pattern => line.includes(pattern))
        )
        .join('\n')
        .trim();
}

/**
 * Perform job processing step to generate archimate HTML report.
 *
 * @param {StatusUtil.StatusUtilType} status - the status.json object
 * @param {string} requestPath - the job queue request path
 * @param {string} archi - the Archi executable 
 * @param {string} filename - the archimate zip file
 * @param {string} reportPath - the folder to generate the HTML report into
 * @returns {Promise<WorkerThreadSuccess | WorkerThreadError>} job success or failure indicator
 */
async function processJobStep2(status, requestPath, archi, filename, reportPath) {

    // Generate archimate HTML report if not already done
    if (status.report.stopMs === null) {

        // Log start attempt
        log(`Worker thread attempting to generate HTML report for: "${filename}"`);

        // Mark report start time in status object
        status.report.startMs = Date.now();

        // Save updated status.json or reject if filesystem error
        try { status = StatusUtil.save(requestPath, status); }
        catch (err) { return fileSystemError('save', 'status', requestPath, err); }

        // Attempt to generate archimate HTML report in job queue request folder
        try {

            // Create the report folder 
            fs.mkdirSync(reportPath, { recursive: true });

            // Construct command line arguments for the archi executable
            const args = [
                '-application', 'com.archimatetool.commandline.app',
                '-consoleLog',
                '-nosplash',
                '--loadModel', filename,
                '--html.createReport', reportPath
            ];

            // Attempt to generate HTML report
            const result = await new Promise((resolve, reject) => {

                // Execute archi client with command line arguments
                execFile(archi, args, { windowsHide: true }, (err, stdout, stderr) => {

                    // Remove warning lines from stderr
                    stderr = removeWarnings(stderr);

                    // Check for error or non-empty stderr and reject
                    if (err || stderr !== '') reject({ err, stdout, stderr });

                    // Otherwise resolve with stdout and stderr
                    else resolve({ err, stdout, stderr });
                });
            });

            // Mark report stop time in status object
            status.report.stopMs = Date.now();

            // Save updated status.json or reject if filesystem error
            try { status = StatusUtil.save(requestPath, status); }
            catch (err) { return fileSystemError('save', 'status', requestPath, err); }

            // Log success
            log(`Worker thread successfully generated HTML report in: "${reportPath}" with: ${result.stdout}`);
        }

        // Catch failure to generate archimate HTML report
        catch (execErr) {

            /** @type {WorkerThreadExecResult} */
            const result = execErr;

            // Declare message variable
            let message = '';

            // Prefer err.message if available
            if (result.err) message = result.err.message;

            //  Otherwise prefer stderr if available
            else if (result.stderr) message = result.stderr;

            // Record error in status object
            status.errors.push({
                timeMs: Date.now(),
                attempt: status.attempts,
                error: `HTML report generation failed: ${message}`
            });

            // Save updated status.json or reject if filesystem error
            try { status = StatusUtil.save(requestPath, status); }
            catch (err) { return fileSystemError('save', 'status', requestPath, err); }

            // Log failure
            log(`Worker thread generate HTML report in: "${reportPath}" caused error: ${message}`, {
                stdout: result.stdout,
                stderr: result.stderr
            });

            // Return error object
            return {
                ok: false,
                error: 'HTML report generation failed',
                details: {
                    message,
                    stdout: result.stdout,
                    stderr: result.stderr
                }
            };
        }
    }

    // Return success
    return { ok: true };
}

/**
 * Perform job processing step to move queue request files to model folder.
 *
 * @param {StatusUtil.StatusUtilType} status - the status.json object
 * @param {InfoUtil.InfoUtilType} info - the info.json object
 * @param {string} requestPath - the job queue request path
 * @param {string} targetPackagePath - the target path for model package
 * @param {string} targetVersionPath - the target path for model package version
 * @param {string} sourceZipFilename - the source archimate zip filename
 * @param {string} targetZipFilename - the target archimate zip filename
 * @param {string} sourceExtractPath - the source archimate unzip extract path
 * @param {string} targetExtractPath - the target archimate unzip extract path
 * @param {string} sourceReportPath - the source archimate report file path
 * @param {string} targetReportPath - the target archimate report file path
 * @returns {WorkerThreadSuccess | WorkerThreadError} job success or failure indicator
 */
function processJobStep3(
    status, info, requestPath,
    targetPackagePath, targetVersionPath,
    sourceZipFilename, targetZipFilename,
    sourceExtractPath, targetExtractPath,
    sourceReportPath, targetReportPath
) {

    // Move files if not already done
    if (status.move.stopMs === null) {

        // Log start attempt
        log(`Worker thread attempting to move: "${requestPath}" to: "${targetVersionPath}"`);

        // Mark move start time in status object
        status.move.startMs = Date.now();

        // Save updated status.json or reject if filesystem error
        try { status = StatusUtil.save(requestPath, status); }
        catch (err) { return fileSystemError('save', 'status', requestPath, err); }

        // Attempt to move queue request files to model folder
        try {

            // Create the target package and version folders
            fs.mkdirSync(targetPackagePath, { recursive: true });
            fs.mkdirSync(targetVersionPath, { recursive: true });

            // Copy source archimate zip file and rename as target zip file
            fs.copyFileSync(sourceZipFilename, targetZipFilename);

            // Copy unzipped archimate files to target version folder
            fs.cpSync(sourceExtractPath, targetExtractPath, { recursive: true });

            // Copy HTML report file structure to target folder
            fs.cpSync(sourceReportPath, targetReportPath, { recursive: true });

            // Mark move stop time in status object
            status.move.stopMs = Date.now();

            // Save updated status.json to target path or reject if filesystem error
            try { status = StatusUtil.save(targetVersionPath, status); }
            catch (err) { return fileSystemError('save', 'status', targetVersionPath, err); }

            // Save copy of info.json to target path or reject if filesystem error
            try { info = InfoUtil.save(targetVersionPath, info,); }
            catch (err) { return fileSystemError('save', 'info', targetVersionPath, err); }

            // Remove the job queue request folder and contents
            fs.rmSync(requestPath, { recursive: true });

            // Log success
            log(`Worker thread successfully moved: "${requestPath}" to: "${targetVersionPath}"`);
        }

        // Catch failure to move files
        catch (err) {

            // Record error in status object
            status.errors.push({
                timeMs: Date.now(),
                attempt: status.attempts,
                error: `Move failed: ${err.message}`
            });

            // Save updated status.json or reject if filesystem error
            try { status = StatusUtil.save(requestPath, status); }
            catch (err) { return fileSystemError('save', 'status', requestPath, err); }

            // Log failure
            log(`Worker thread move from: "${requestPath}" to: "${targetVersionPath}" caused error: ${err.message}`, { stack: err.stack });

            // Return error object
            return {
                ok: false,
                error: 'Move failed',
                details: { message: err.message, stack: err.stack }
            };
        }
    }

    // Return success
    return { ok: true };
}

/**
 * Perform core job processing.
 *
 * @param {import('./JobUtil.mjs').WorkerJob} job - worker job object
 * @param {import('./ServerUtil.mjs').ConfigOptionsType} config - server configuration
 * @returns {Promise<WorkerThreadSuccess | WorkerThreadError>} job success or failure indicator
 */
async function processJob(job, config) {

    // Log worker processing job
    log(`Worker thread processing job for: "${job.requestId}"`);

    // Construct job queue request path
    const requestPath = path.join(config.QUEUE_DIR, job.requestId);

    // Load info.json or reject if filesystem error
    let info;
    try { info = InfoUtil.load(requestPath); }
    catch (err) { return fileSystemError('load', 'info', requestPath, err); }

    // Load status.json or reject if filesystem error
    let status;
    try { status = StatusUtil.load(requestPath); }
    catch (err) { return fileSystemError('load', 'status', requestPath, err); }

    // Construct source paths
    const sourceZipFilename = path.join(requestPath, `${info.versionMs.toString(10)}.archimate`);
    const sourceExtractPath = path.join(requestPath, 'archimate');
    const sourceReportPath = path.join(requestPath, 'report');

    // Construct target paths
    const targetPackagePath = path.join(config.MODEL_DIR, info.packageName);
    const targetVersionPath = path.join(targetPackagePath, `${info.versionMs.toString(10)}`);
    const targetZipFilename = path.join(targetVersionPath, 'model.archimate');
    const targetExtractPath = path.join(targetVersionPath, 'archimate');
    const targetReportPath = path.join(targetVersionPath, 'report');

    // Increment job processing attempt counter
    status.attempts++;

    // Declare a job status result
    let result;

    // Execute job step 1 to extract archimate zip file or reject if error
    result = processJobStep1(status, requestPath, sourceZipFilename, sourceExtractPath);
    if (!result.ok) return result;

    // Execute job step 2 to generate archimate HTML report or reject if error
    result = await processJobStep2(status, requestPath, config.ARCHI, sourceZipFilename, sourceReportPath);
    if (!result.ok) return result;

    // Execute job step 3 to move queue request files to model folder or reject if error
    result = processJobStep3(
        status, info, requestPath,
        targetPackagePath, targetVersionPath,
        sourceZipFilename, targetZipFilename,
        sourceExtractPath, targetExtractPath,
        sourceReportPath, targetReportPath);
    if (!result.ok) return result;

    // Mark completed time in status object
    status.completedMs = Date.now();

    // Save updated status.json or reject if filesystem error
    try { status = StatusUtil.save(targetVersionPath, status); }
    catch (err) { return fileSystemError('save', 'status', targetVersionPath, err); }

    // return success
    return { ok: true };
}

/**
 * Worker main entry point.
 * 
 * @param {import('./JobUtil.mjs').WorkerJob} job - worker job object
 * @param {import('./ServerUtil.mjs').ConfigOptionsType} config - server configuration
 * @returns {Promise<void>}
 */
async function runWorker(job, config) {

    // Log worker started
    log(`Worker thread started for: "${job.requestId}"`);

    // Process job queue
    const result = await processJob(job, config);

    // Log success and exit worker
    if (result.ok) {
        log(`Worker thread completed job for: "${job.requestId}"`);
        parentPort.postMessage({ ok: true });
        return;
    }

    // Log invalid result and exit worker
    if (!result || typeof result !== 'object') {
        log(`Worker thread returned invalid result for: "${job.requestId}"`, result);
        parentPort.postMessage({ ok: false, error: 'Invalid worker result', details: result });
        return;
    }

    // Log error 
    log(`Worker thread for: "${job.requestId}" caused error: ${result.error}`, result.details);

    parentPort.postMessage({
        ok: false,
        error: result.error,
        details: result.details || null
    });
}

// Start worker
runWorker(workerData.job, workerData.config);