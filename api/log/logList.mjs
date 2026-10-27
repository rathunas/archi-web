/**
 * @file logList
 * API request handler for returning list of server log files.
 */

import { list } from '../../lib/FileUtil.mjs'; // File utilities
import { isLogFile } from '../../lib/LogUtil.mjs'; // Logger utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Transform a file system metadata entry into a server log file entry.
 * 
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - file system metadata entry
 * @returns {import('../../static/util/LogUtil.mjs').LogFileSystemEntry} server log file system entry
 */
function toLogFileEntry(entry) {

    // Return server log file system entry
    return {
        filename: entry.name,
        mtimeMs: entry.mtimeMs,
        size: entry.size
    };
}

/**
 * Return list of server log files.
 *
 * @returns {import('../../static/util/LogUtil.mjs').LogFileSystemEntry[]} list of server log files
 */
export function logListData() {

    // Return server log file entries
    return list({
        dir: config.LOG_DIR,
        filter: isLogFile,
        transform: toLogFileEntry
    });
}

/**
 * API request handler for returning list of log files.
 *
 * @param {import('express').Request<{}, import('../../static/util/LogUtil.mjs').LogFileSystemEntry>} req - the express request object
 * @param {import('express').Response<import('../../static/util/LogUtil.mjs').LogFileSystemEntry>} res - the express response object
 */
export function logListApi(req, res) {

    // Get server log file entries
    const entries = logListData();

    // Send response
    res.json(entries);
}