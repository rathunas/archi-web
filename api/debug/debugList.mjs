/**
 * @file debugList
 * API request handler for returning list of debug files.
 */

import { isFile, list } from '../../lib/FileUtil.mjs'; // File utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Transform a file system metadata entry into a debug file entry.
 * 
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - file system metadata entry
 * @returns {import('../../static/util/DebugUtil.mjs').DebugFileSystemEntry} debug file system entry
 */
function toDebugFileEntry(entry) {

    // Return debug file system entry
    return {
        filename: entry.name,
        mtimeMs: entry.mtimeMs,
        size: entry.size
    };
}

/**
 * Return list of debug files.
 *
 * @returns {import('../../static/util/DebugUtil.mjs').DebugFileSystemEntry[]} list of debug files
 */
export function debugListData() {

    // Return debug file entries
    return list({
        dir: config.DEBUG_DIR,
        filter: isFile,
        transform: toDebugFileEntry
    });
}

/**
 * API request handler for returning list of debug files.
 *
 * @param {import('express').Request<{}, import('../../static/util/DebugUtil.mjs').DebugFileSystemEntry>} req - the express request object
 * @param {import('express').Response<import('../../static/util/DebugUtil.mjs').DebugFileSystemEntry>} res - the express response object
 */
export function debugListApi(req, res) {

    // Get debug file entries
    const entries = debugListData();

    // Send response
    res.json(entries);
}