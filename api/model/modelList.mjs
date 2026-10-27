/**
 * @file modelList
 * API request handler for returning list of model package folders.
 */

import { list } from '../../lib/FileUtil.mjs'; // File utilities
import { isPackageNameFolder, isVersionMsFolder } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Transform a file system metadata entry into a model design package name entry.
 * 
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - file system metadata entry
 * @returns {import('../../lib/ModelUtil.mjs').ModelPackageNameEntry} model design package name entry
 */
function toPackageNameEntry(entry) {

    // Fetch model design package version folder entries
    const versions = list({
        dir: entry.fullPath,
        filter: isVersionMsFolder
    });

    // Return model design package entry
    return {
        packageName: entry.name,
        versions: versions.length
    };
}

/**
 * Return list of model design package folder entries.
 *
 * @returns {import('../../static/util/ModelUtil.mjs').ModelPackageNameEntry[]} list of model design package folder entries
 */
export function modelListData() {

    // Return model design package folder entries
    return list({
        dir: config.MODEL_DIR,
        filter: isPackageNameFolder,
        transform: toPackageNameEntry
    });
}

/**
 * API request handler for returning list of model design package folder entries.
 *
 * @param {import('express').Request<{},import('../../lib/ModelUtil.mjs').ModelPackageNameEntry[]>} req - the express request object
 * @param {import('express').Response<import('../../lib/ModelUtil.mjs').ModelPackageNameEntry[]>} res - the express response object
 */
export function modelListApi(req, res) {

    // Get model design package folder entries
    const entries = modelListData();

    // Send response
    res.json(entries);
}