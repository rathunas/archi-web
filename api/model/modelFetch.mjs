/**
 * @file modelFetch
 * API equest handler for fetching model files and folders.
 */

import fs from 'fs'; // File system access
import path from 'path'; // Path utilities
import { BadRequestError, NotFoundError } from '../../lib/HtmlUtil.mjs'; // HTML utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validatePackageName, validateVersionMs } from '../../lib/ModelUtil.mjs'; // Design model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * API request parameters fetching model package version files.
 * @typedef ModelFetchRequestParams
 *
 * @property {string} packageName - the model package name
 * @property {number} version - the model package version timestamp in milliseconds
 * @property {string} path - the file path to fetch
 */

/**
 * API request handler for fetching model package version files.
 *
 * @param {import('express').Request<ModelFetchRequestParams, string>} req - the express request object
 * @param {import('express').Response<string>} res - the express response object
 */
export function modelFetchApi(req, res) {

    // Extract package and version from route parameters
    let { packageName, versionMs, path: wildcardPath } = req.params;

    // Reject invalid design package path
    packageName = validatePackageName(packageName);

    // Reject invalid version
    versionMs = validateVersionMs(versionMs);

    // Build the base directory for this model package version
    const baseDir = path.join(config.MODEL_DIR, packageName, versionMs.toString(10));

    // Build the full path to the requested resource
    const fullPath = path.resolve(baseDir, ...wildcardPath);

    // Reject directory traversal outside the base directory
    if (!fullPath.toLowerCase().startsWith(baseDir.toLowerCase())) {
        throw new BadRequestError(`Fetch failed as attempted directory traversal: "${fullPath}"`);
    }

    // Reject if requested path does not exist
    if (!fs.existsSync(fullPath)) {
        throw new NotFoundError(`Fetch failed as path does not exist: "${fullPath}"`);
    }

    // Get filesystem metadata
    const stat = fs.statSync(fullPath);

    // Check if the path is a directory
    if (stat.isDirectory()) {

        // Read directory contents
        const entries = fs.readdirSync(fullPath);

        // Log successful directory listing
        log(`Fetched directory listing: "${fullPath}"`);

        // Send directory listing
        return res.json({ entries });
    }

    // Otherwise log successful file fetch
    log(`Fetched file: "${fullPath}"`);

    // Serve the file
    return res.sendFile(fullPath);
}