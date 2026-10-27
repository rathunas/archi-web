/**
 * @file queueList
 * Client side behaviour for queueList view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { formatDateTime } from '../util/DateUtil.mjs'; // Date utilities
import { sortByNumber, sortByString } from '../util/SortUtil.mjs'; // Sort utilities
import { WorkerStatus } from '../util/WorkerUtil.mjs'; // Worker utilities

/**
 * Data table element for queue list.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<
 *           import('../util/QueueUtil.mjs').QueueRequestEntry>
 * } QueueListDataTableElement
 */

/**
 * Handler for transforming a data table row into fields.
 *
 * @param {import('../util/QueueUtil.mjs').QueueRequestEntry[]} rows - queue file system entry list
 * @param {Object.<string, HTMLElement>} fields - cloned field elements
 * @param {number} index - row index to transform
 * @returns {void}
 */
function handleTransform(rows, fields, index) {

    // Get current row
    const row = rows[index];

    // Set selector value to requestId
    fields['list-selector'].value = row.requestId;

    // Construct anchor element for requestId
    const requestIdLink = document.createElement('a');
    requestIdLink.href = `/queue/${row.requestId}`;
    requestIdLink.textContent = row.requestId;
    fields['request-id'].appendChild(requestIdLink);

    // Populate request submitted date cell
    const submittedDate = formatDateTime(row.submittedMs);
    fields['submitted-date'].dataset.value = row.submittedMs;
    fields['submitted-date'].textContent = submittedDate;

    // Populate job status cell
    fields['job-status'].textContent = row.jobStatus;

    // Construct anchor element for filename
    const filenameLink = document.createElement('a');
    filenameLink.href = `/api/queue/${row.requestId}/download`;
    filenameLink.textContent = row.filename;
    fields['filename'].appendChild(filenameLink);

    // Convert version to date
    const versionDate = formatDateTime(row.versionMs);
    fields['version-date'].dataset.value = row.versionMs.toString(10);

    // Check if wiki URL exists
    if (typeof data.wiki === 'string') {

        // Construct anchor element for packageName
        const packageNameLink = document.createElement('a');
        const packageNameUriEncoded = encodeURIComponent(row.packageName);
        packageNameLink.href = `${data.wiki}${packageNameUriEncoded}`;
        packageNameLink.textContent = row.packageName;
        fields['package-name'].appendChild(packageNameLink);

        // Construct anchor element for version
        const versionDatelink = document.createElement('a');
        versionDatelink.href = `${data.wiki}${packageNameUriEncoded}/${row.versionMs.toString(10)}`;
        versionDatelink.textContent = versionDate;
        fields['version-date'].appendChild(versionDatelink);
    }

    else {

        // Populate package name cell
        fields['package-name'].textContent = row.packageName;

        // Populate version date cell
        fields['version-date'].textContent = versionDate;
    }
}

/**
 * Handler for sorting rows in the data table.
 *
 * @param {import('../util/QueueUtil.mjs').QueueRequestEntry[]} rows - queue file system entry list
 * @param {string} key - property name to sort on
 * @param {boolean} ascending - true if sort ascending
 * @returns {boolean} true if sort successful
 */
function handleSort(rows, key, ascending = true) {

    // Sort on `request-id`
    if (key === 'request-id') {
        sortByString(rows, 'requestId', ascending);
        return true;
    }

    // Sort by `submited-date`
    if (key === 'submitted-date') {
        sortByNumber(rows, 'submittedMs', ascending);
        return true;
    }

    // Sort on `filename`
    if (key === 'filename') {
        sortByString(rows, 'filename', ascending);
        return true;
    }

    // Sort on `job-status`
    if (key === 'job-status') {
        sortByString(rows, 'jobStatus', ascending);
        return true;
    }

    // Sort by `version-date`
    if (key === 'version-date') {
        sortByNumber(rows, 'versionMs', ascending);
        return true;
    }

    // Sort on `package-name`
    if (key === 'package-name') {
        sortByString(rows, 'packageName', ascending);
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

/** Data table element. @type {QueueListDataTableElement} */
const dataTable = document.getElementById('list');

/** Initial data payload. @type {import('../util/QueueUtil.mjs').QueueRequestList} */
let data = JSON.parse(document.getElementById('data').textContent);

// Set data table rows
dataTable.rows = data.requests;

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
    window.location.href = '/queue/add';
};

// Click handler for delete button
deleteButton.onclick = async function () {

    // Get selected rows
    const selectedRows = dataTable.getSelectedData();

    // Reject empty selection
    if (selectedRows.length === 0) {
        return alert('No requests selected');
    }

    // Extract requests
    const requestIds = selectedRows.map(rows => rows.requestId);

    // Handle API delete
    try {

        // Send delete request
        const res = await fetch('/api/queue', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestIds })
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

/**
 * Count the number of active jobs.
 * 
 * @returns {number} The count of active jobs.
 */
function countActiveJobs() {

    // Count active jobs
    const activeJobs = data.requests.filter(row => row.jobStatus === WorkerStatus.ACTIVE);

    // Return count of active jobs
    return activeJobs.length;
}

/**
 * Fetch the page data from the server.
 * 
 * @returns {Promise<import('../util/QueueUtil.mjs').QueueRequestList|null>} the fetched job queue list or null if failed.
 */
async function fetchData() {

    // Get request data
    const res = await fetch('/api/queue');

    // Return empty array if not ok
    if (!res.ok) return [];

    // Else return fetched job queue request data
    return await res.json();
}

// Check if any job status is ACTIVE to set up page refresh
if (countActiveJobs() > 0) {

    // Set interval to refresh page every second
    const refreshIntervalId = setInterval(async () => {

        // Refresh the page
        const newData = await fetchData();

        // Check if refreshed data is valid
        if (newData) {

            // Update data
            data = newData;

            // Update table rows
            dataTable.rows = newData.requests;

            // Render the table with refreshed data
            dataTable.render();

            // Check if job status is no longer ACTIVE
            if (countActiveJobs() === 0) {

                // Clear the refresh interval
                clearInterval(refreshIntervalId);
            }
        }

    }, 1000);
}