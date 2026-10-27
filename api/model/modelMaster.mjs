/**
 * @file modelMaster
 * API to download a transformed master archimate file.
 */

import { zipSync } from 'fflate'; // Synchronous ZIP builder
import fs from 'fs'; // File system access
import path from 'path'; // Path utilities
import { NotFoundError } from '../../lib/HtmlUtil.mjs'; // HTTP error utilities
import { getLatestVersionMs, replaceTemplateIds, validatePackageName, validateVersionMs } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * API request handler for downloading a transformed master archimate file.
 *
 * @param {import('express').Request<ModelMasterRequestParams>} req - the express request object
 * @param {import('express').Response} res - the express response object
 * @param {import('express').NextFunction} next - the express next function
 */
export function modelMasterApi(req, res, next) {

    // Extract package and version from route parameters
    let { packageName, versionMs } = req.params;

    // Reject invalid version parameter (must be "latest" or a number)
    if (!/^(latest|\d+)$/.test(versionMs)) return next('route');

    // Reject invalid design package path
    packageName = validatePackageName(packageName);

    // Build the base directory for master model design package
    const masterPath = path.join(config.MODEL_DIR, config.MASTER);

    // Reject if master model design package does not exist
    if (!fs.existsSync(masterPath)) {
        throw new NotFoundError(`Cannot find master design package: "${config.MASTER}"`);
    }

    // Check if request latest version in master model design package
    if (versionMs === 'latest') {

        // Attempt to get latest version in master design package directory
        versionMs = getLatestVersionMs(masterPath);

        // Reject if no version folders found
        if (versionMs === undefined) {
            throw new NotFoundError(`Cannot find latest version for master design package: "${config.MASTER}"`);
        }
    }

    // Reject invalid version
    versionMs = validateVersionMs(versionMs);

    // Build the base directory for master model design package version
    const versionPath = path.join(masterPath, versionMs.toString(10));

    // Check if request is to download untransformed master
    if (packageName === config.MASTER) {

        // Construct path to master zipped model file
        const masterFile = path.join(versionPath, 'model.archimate');

        // Transfer the master model file
        return res.download(masterFile, `${config.MASTER}.archimate`);
    }

    // Build archimate directory path
    const archimateDir = path.join(versionPath, 'archimate');

    // Construct path to master model.xml file
    const modelPath = path.join(archimateDir, 'model.xml');

    // Load model.xml into memory
    let xml = fs.readFileSync(modelPath, 'utf8');

    // Replace placeholder with package name
    xml = xml.replace(/\$\{packageName\}/g, packageName);

    // Replace placeholder with version timestamp in milliseconds
    xml = xml.replace(/\$\{versionMs\}/g, versionMs.toString(10));

    // Replace IDs for all template-marked elements and their descendants
    xml = replaceTemplateIds(xml);

    // Build file map for zipSync with only modified model.xml at ZIP root
    const fileMap = {
        'model.xml': new TextEncoder().encode(xml)
    };

    // Recursively add all other files and folders under archimateDir
    function addDir(dirPath, zipPath) {

        // Read directory entries
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        // Ensure empty directory is created on unzip
        if (zipPath !== '') {
            fileMap[zipPath + '/'] = new Uint8Array(0);
        }

        // Process each entry
        for (const entry of entries) {

            // Build full file system path
            const fullPath = path.join(dirPath, entry.name);

            // Build zip entry path
            const zipEntryPath = zipPath === '' ? entry.name : zipPath + '/' + entry.name;

            // Skip model.xml because we already added modified version
            if (zipEntryPath === 'model.xml') continue;

            // Add nested directory
            if (entry.isDirectory()) {
                addDir(fullPath, zipEntryPath);
                continue;
            }

            // Add file bytes
            const data = fs.readFileSync(fullPath);
            fileMap[zipEntryPath] = data;
        }
    }

    // Add archimate directory contents at ZIP root
    addDir(archimateDir, '');

    // Build ZIP archive synchronously
    const zipBytes = zipSync(fileMap);

    // Set response headers for zip download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${packageName}.archimate"`);

    // Send ZIP to client
    res.send(Buffer.from(zipBytes));
}