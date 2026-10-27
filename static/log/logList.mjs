/**
 * @file logList
 * Client side behaviour for logList view.
 */

import { formatDateTime } from '../util/DateUtil.mjs'; // Date utilities
import { sortByNumber, sortByString } from '../util/SortUtil.mjs'; // Sort utilities

/**
 * Data payload for logList view.
 * 
 * @typedef {import('../util/LogUtil.mjs').LogFileSystemEntry[]} LogListData
 */

/**
 * Data table element for log file list.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<
 *           import('../util/LogUtil.mjs').LogFileSystemEntry>
 * } LogListDataTableElement
 */

/**
 * Handler for transforming a data table row into fields.
 *
 * @param {LogListData} rows - log file system entry list
 * @param {Object.<string, HTMLElement>} fields - cloned field elements
 * @param {number} index - row index to transform
 * @returns {void}
 */
function handleTransform(rows, fields, index) {

    // Get current row
    const row = rows[index];

    // Construct anchor element for filename
    const link = document.createElement('a');
    const nameUriEncoded = encodeURIComponent(row.filename);
    link.href = `/log/${nameUriEncoded}`;
    link.textContent = row.filename;
    fields['filename'].appendChild(link);

    // Populate modified date cell
    const mtimeDate = formatDateTime(row.mtimeMs);
    fields['modified-date'].dataset.value = row.mtimeMs;
    fields['modified-date'].textContent = mtimeDate;

    // Populate file size cell
    fields['size'].textContent = row.size;
}

/**
 * Handler for sorting rows in the data table.
 *
 * @param {LogListData} rows - log file system entry list
 * @param {string} key - property name to sort on
 * @param {boolean} [ascending] - true if sort ascending otherwise sort descending (default true)
 * @returns {boolean} true if sort successful
 */
function handleSort(rows, key, ascending = true) {

    // Sort on `filename`
    if (key === 'filename') {
        sortByString(rows, 'filename', ascending);
        return true;
    }

    // Sort by `modified-date`
    if (key === 'modified-date') {
        sortByNumber(rows, 'mtimeMs', ascending);
        return true;
    }

    // Sort by `size`
    if (key === 'size') {
        sortByNumber(rows, 'size', ascending);
        return true;
    }

    // Else log error
    console.log(`Error: property key "${key}" is not sortable`);
    return false;
}

/** Data table element. @type {LogListDataTableElement} */
const dataTable = document.getElementById('list');

/** Initial data payload @type {LogListData}. */
const rows = JSON.parse(document.getElementById('data').textContent);

// Sort by descending filename
sortByString(rows, 'filename', false);

// Set data table row source sorted by descending filename
dataTable.rows = rows

// Handle data table field transformation
dataTable.transform = handleTransform;

// Handle data table row sort
dataTable.sort = handleSort;

// Render the data table
dataTable.render();