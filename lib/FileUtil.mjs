/**
 * @module FileUtil
 * Server side file utilities.
 */

import fs from 'fs'; // File system utilities
import path from 'path'; // Path utilities
import { fileURLToPath } from 'url'; // URL utilities

// Re-export client side utilities
export * from '../static/util/FileUtil.mjs';

// Import server-side versions of the error classes
import { InvalidPathSegment } from '../static/util/FileUtil.mjs';

// Get directory for this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Root directory for all modules and files. */
export const root = path.dirname(__dirname);

/**
 * Determine if a filesystem entry is a regular file.
 *
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - the filesystem entry metadata
 * @returns {boolean} true if the entry is a regular file, otherwise false
 */
export function isFile(entry) {

    // Return true if entry is a regular file
    return entry.isFile;
}

/**
 * Error when a path is not found.
 */
export class PathNotFound extends Error { }

/**
 * Error when a filesystem path already exists.
 */
export class PathExists extends Error { }

/**
 * Error when a filesystem path cannot be renamed.
 */
export class PathRenameError extends Error { }

/**
 * Error when a filesystem path cannot be deleted.
 */
export class PathDeleteError extends Error { }

/**
 * Metadata describing a single filesystem entry.
 * 
 * @typedef {Object} FileSystemEntry
 *
 * @property {string} name - the entry name exactly as stored in the directory
 * @property {string} basePath - the directory path to entry name
 * @property {string} fullPath - the full path to entry name
 * @property {boolean} isFile - true if the entry is a regular file
 * @property {boolean} isDirectory - true if the entry is a directory
 * @property {number} mtimeMs - last modified time in milliseconds; for files this is when contents last changed, for directories this is when entries were added or removed
 * @property {number} ctimeMs - last metadata change time in milliseconds; includes permission changes, ownership changes and inode updates
 * @property {number} atimeMs - last access time in milliseconds; updated when the file or directory is read, subject to system atime settings
 * @property {number|null} size - the file size in bytes or null if directory
 */

/**
 * Create filesystem entry metadata.
 *
 * @param {string} name - entry name
 * @property {string} basePath - the directory path to entry name
 * @property {string} fullPath - the full path to entry name
 * @param {fs.Stats} stats - filesystem stats object
 * @returns {FileSystemEntry} metadata describing the filesystem entry
 */
function createEntry(name, basePath, fullPath, stats) {

    // Construct metadata object
    return {
        name,
        basePath,
        fullPath,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mtimeMs: stats.mtimeMs,
        ctimeMs: stats.ctimeMs,
        atimeMs: stats.atimeMs,
        size: stats.isFile() ? stats.size : null
    };
}

/**
 * Filter function for filesystem entries.
 * 
 * @callback FileSystemEntryFilter
 *
 * @param {FileSystemEntry} entry - the filesystem entry metadata
 * @return {boolean} true if the entry is included in the results, otherwise false
 */

/**
 * Function for constructing a list item from a file system entry.
 * 
 * @template T - list item type
 * @callback FileSystemEntryTransformer
 * 
 * @param {FileSystemEntry} entry - the filesystem entry metadata
 * @return {T} the list item
 */

/**
 * List options.
 * 
 * @template {string|number|boolean|object} T list item type
 * @typedef {Object} ListOptions
 * 
 * @property {string} dir - the directory path to read
 * @property {FileSystemEntryFilter} [filter] - optional filter function for filesystem entries
 * @property {FileSystemEntryTransformer<T>} [transform] - optional transformation function for filesystem entries
 */

/**
 * List all entries in a directory path.
 *
 * @template {string|number|boolean|object} [T=FileSystemEntry] list item type
 *
 * @param {ListOptions<T>} options - options for listing entries
 * @returns {T[]} list of entries
 *
 * @throws {InvalidPathSegment} if dir not a string
 * @throws {Error} if directory traversal attempted or filesystem error
 */
export function list(options) {

    // Reject if options not an object
    if (typeof options !== 'object') {
        throw new TypeError(`Options must be an object: ${JSON.stringify(options)}`);
    }

    // Reject if directory path not a string
    if (typeof options.dir !== 'string') {
        throw new InvalidPathSegment(`Directory path must be a string: ${JSON.stringify(options.dir)}`);
    }

    // Resolve directory path
    const fullDir = path.resolve(options.dir);

    // Reject if traversal outside directory
    if (!fullDir.toLowerCase().startsWith(options.dir.toLowerCase())) {
        throw new InvalidPathSegment(`Attempted directory traversal outside: "${options.dir}"`);
    }

    /** Array of resulting metadata. @type {T[]} */
    const result = [];

    // Read directory contents
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });

    // Loop through entries
    for (const entry of entries) {

        // Build full path to entry
        const fullPath = path.join(fullDir, entry.name);

        // Read filesystem stats
        const stats = fs.statSync(fullPath);

        // Construct metadata object
        let metadata = createEntry(entry.name, fullDir, fullPath, stats);

        // Filter out unwanted entries
        if (options.filter && !options.filter(metadata)) continue;

        // Transform the metadata if required
        if (options.transform) metadata = options.transform(metadata);

        // Append metadata to results array
        result.push(metadata);
    }

    // Return array of metadata
    return result;
}

/**
 * Get contents of a file.
 *
 * @param {string} dir - the directory path to the filename
 * @param {string} filename - the filename to fetch contents from
 * @param {FileSystemEntryFilter} [filter] - optional filter function for filesystem entries
 * @returns {string} contents of the file
 *
 * @throws {InvalidPathSegment} if dir or filename not a string
 * @throws {InvalidPathSegment} if directory traversal attempted
 * @throws {PathNotFound} if filename not found
 */
export function load(dir, filename, filter) {

    // Reject if directory path not a string
    if (typeof dir !== 'string') {
        throw new InvalidPathSegment(`Directory path must be a string: ${JSON.stringify(dir)}`);
    }

    // Reject if filename not a string
    if (typeof filename !== 'string') {
        throw new InvalidPathSegment(`Filename must be a string: ${JSON.stringify(filename)}`);
    }

    // Resolve full path
    const fullPath = path.resolve(dir, filename);

    // Reject if traversal outside directory
    if (!fullPath.toLowerCase().startsWith(dir.toLowerCase())) {
        throw new InvalidPathSegment(`Attempted directory traversal outside: "${dir}"`);
    }

    // Reject if filename does not exist
    if (!fs.existsSync(fullPath)) {
        throw new PathNotFound(`Path not found: "${filename}"`);
    }

    // Read filesystem stats
    const stats = fs.statSync(fullPath);

    // Construct metadata object
    const entry = createEntry(filename, dir, fullPath, stats);

    // Reject if invalid file
    if (filter && !filter(entry)) {
        throw new InvalidPathSegment(`Path invalid: "${filename}"`);
    }

    // Read file contents (throws filesystem error)
    const contents = fs.readFileSync(fullPath, 'utf8');

    // Return contents
    return contents;
}

/**
 * Save contents to a file.
 *
 * @param {string} dir - the directory path to the filename
 * @param {string} filename - the filename to write contents to
 * @param {string} contents - the file contents to write
 * @param {boolean} [overwrite=false] - whether to overwrite an existing file
 *
 * @throws {InvalidPathSegment} if dir or filename not a string
 * @throws {InvalidPathSegment} if directory traversal attempted
 * @throws {PathExists} if file exists and overwrite is false
 */
export function save(dir, filename, contents, overwrite = false) {

    // Reject if directory path not a string
    if (typeof dir !== 'string') {
        throw new InvalidPathSegment(`Directory path must be a string: ${JSON.stringify(dir)}`);
    }

    // Reject if filename not a string
    if (typeof filename !== 'string') {
        throw new InvalidPathSegment(`Filename must be a string: ${JSON.stringify(filename)}`);
    }

    // Resolve full path
    const fullPath = path.resolve(dir, filename);

    // Reject if traversal outside directory
    if (!fullPath.toLowerCase().startsWith(dir.toLowerCase())) {
        throw new InvalidPathSegment(`Attempted directory traversal outside: "${dir}"`);
    }

    // Reject if file exists and overwrite is false
    if (!overwrite && fs.existsSync(fullPath)) {
        throw new PathExists(`Filename already exists: "${filename}"`);
    }

    // Write file contents (throws filesystem error)
    fs.writeFileSync(fullPath, contents, 'utf8');

    // Return full path written
    return fullPath;
}

/**
 * Delete multiple filesystem paths.
 *
 * Paths may be files or folders.
 * Use options for recursive deletion and for forced removal of empty or protected paths.
 *
 * @param {string} dir - the directory path prefix
 * @param {string[]} segments - array of path segments to delete
 * @param {FileUtilPathSegmentValidator} validator - a path segment validator function
 * @param {fs.RmOptions} [options] - path removal options
 * @returns {number} number of deleted paths
 *
 * @throws {InvalidPathSegment} if dir not a string
 * @throws {InvalidPathSegment} if segments not an array
 * @throws {InvalidPathSegment} if a segment fails validation
 * @throws {PathDeleteError} if a filesystem delete operation fails
 */
export function deletePaths(dir, segments, validator, options) {

    // Reject if directory path not a string
    if (typeof dir !== 'string') {
        throw new InvalidPathSegment(`Directory path must be a string: ${JSON.stringify(dir)}`);
    }

    // Reject if segments not an array
    if (!Array.isArray(segments)) {
        throw new InvalidPathSegment(`Path segments must be an array: ${JSON.stringify(segments)}`);
    }

    // Resolve directory path
    const fullDir = path.resolve(dir);

    // Reject if traversal outside directory
    if (!fullDir.toLowerCase().startsWith(dir.toLowerCase())) {
        throw new InvalidPathSegment(`Attempted directory traversal outside: "${dir}"`);
    }

    // Track number of deleted paths
    let deletedCount = 0;

    // Delete each path safely
    for (let segment of segments) {

        // Validate path segment
        segment = validator(segment, false, 'Path segment');

        // Build full path
        const fullPath = path.join(fullDir, segment);

        // Skip if path does not exist
        if (!fs.existsSync(fullPath)) continue;

        // Attempt delete
        try { fs.rmSync(fullPath, options); }
        catch (err) { throw new PathDeleteError(`Delete: "${fullPath}" caused error: ${err.message}`); }

        // Increment delete counter
        deletedCount++;
    }

    // Return number of deleted paths
    return deletedCount;
}

/**
 * Rename a filesystem path.
 *
 * Paths may be files or folders.
 *
 * @param {string} dir - the directory path prefix
 * @param {string} source - the source path segment
 * @param {string} target - the target path segment
 * @param {FileUtilPathSegmentValidator} validator - a path segment validator function
 * @returns {string} the new path segment
 *
 * @throws {InvalidPathSegment} if dir, source or target are invalid
 * @throws {InvalidPathSegment} if directory traversal attempted
 * @throws {PathNotFound} if source does not exist
 * @throws {PathExists} if target already exists
 * @throws {PathRenameError} if rename fails
 */
export function renamePath(dir, source, target, validator) {

    // Reject if directory path not a string
    if (typeof dir !== 'string') {
        throw new InvalidPathSegment(`Directory path must be a string: ${JSON.stringify(dir)}`);
    }

    // Validate segments
    source = validator(source, false, 'Source name');
    target = validator(target, false, 'Target name');

    // Resolve directory path
    const fullDir = path.resolve(dir);

    // Reject if traversal outside directory
    if (!fullDir.toLowerCase().startsWith(dir.toLowerCase())) {
        throw new InvalidPathSegment(`Attempted directory traversal outside: "${dir}"`);
    }

    // Build full paths
    const sourcePath = path.join(fullDir, source);
    const targetPath = path.join(fullDir, target);

    // Reject if source does not exist
    if (!fs.existsSync(sourcePath)) {
        throw new PathNotFound(`Source not found: "${source}"`);
    }

    // Reject if target exists
    if (fs.existsSync(targetPath)) {
        throw new PathExists(`Target already exists: "${target}"`);
    }

    // Attempt rename
    try { fs.renameSync(sourcePath, targetPath); }
    catch (err) { throw new PathRenameError(`Rename: "${source}" to: "${target}" caused error: ${err.message}`); }

    // Return new path segment
    return target;
}
