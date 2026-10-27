/**
 * @file debugList
 * Client side behaviour for debugList view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { formatDateTime } from '../util/DateUtil.mjs'; // Date utilities
import { sortByNumber, sortByString } from '../util/SortUtil.mjs'; // Sort utilities

/**
 * Data table element for debug list.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<
 *           import('../util/DebugUtil.mjs').DebugFileSystemEntry>
 * } debugListDataTableElement
 */

/**
 * Handler for transforming a data table row into fields.
 *
 * @param {import('../util/DebugUtil.mjs').DebugFileSystemEntry[]} rows - debug file system entry list
 * @param {Object.<string, HTMLElement>} fields - cloned field elements
 * @param {number} index - row index to transform
 * @returns {void}
 */
function handleTransform(rows, fields, index) {

    // Get current row
    const row = rows[index];

    // Set selector value to filename
    fields['list-selector'].value = row.filename;

    // Construct anchor element for filename
    const link = document.createElement('a');
    const nameUriEncoded = encodeURIComponent(row.filename);
    link.href = `/debug/show/${nameUriEncoded}`;
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
 * @param {import('../util/DebugUtil.mjs').DebugFileSystemEntry[]} rows - debug file system entry list
 * @param {string} key - property name to sort on
 * @param {boolean} ascending - true if sort ascending
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

/** Add button element. @type {HTMLButtonElement} */
const addButton = document.getElementById('add-button');

/** Delete button element. @type {HTMLButtonElement} */
const deleteButton = document.getElementById('delete-button');

/** Data table element. @type {debugListDataTableElement} */
const dataTable = document.getElementById('list');

/** Initial data payload. @type {import('../util/DebugUtil.mjs').DebugFileSystemEntry[]} */
const rows = JSON.parse(document.getElementById('data').textContent);

// Set data table rows
dataTable.rows = rows;

// Handle data table field transformation
dataTable.transform = handleTransform;

// Handle data table row sort
dataTable.sort = handleSort;

// Wire selection change behaviour
dataTable.onSelectionChange = selected => {

    // Determine if any rows are selected
    const isSelected = selected.length > 0;

    // Add enabled only when none selected
    disableButton(addButton, isSelected);

    // Delete enabled only when some selected
    disableButton(deleteButton, !isSelected);
};

// Render the data table
dataTable.render();

// Click handler for add button
addButton.onclick = () => {

    // Navigate to add page
    window.location.href = '/debug/add';
};

// Click handler for delete button
deleteButton.onclick = async function () {

    // Get selected rows
    const selectedRows = dataTable.getSelectedData();

    // Reject empty selection
    if (selectedRows.length === 0) {
        return alert('No files selected');
    }

    // Extract filenames
    const filenames = selectedRows.map(rows => rows.filename);

    // Handle API delete
    try {

        // Send delete request
        const res = await fetch('/api/debug', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filenames })
        });

        // Parse JSON
        const json = await res.json();

        // If server returned an error field, show it
        if (json.error) {
            return alert(json.error);
        }

        // Reload this page
        window.location.reload();

    } catch (err) {

        // Network or unexpected error
        alert('Delete failed: ' + err.message);
    }
};