/**
 * @file queueShow
 * Client side behaviour for queueShow view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { formatDateTime } from '../util/DateUtil.mjs'; // Date utilities
import { handleSort, handleTransform } from '../util/ErrorUtil.mjs';
import page from '../util/PageUtil.mjs'; // Page utilities
import { getEventDuration } from '../util/StatusUtil.mjs'; // Status file utilities
import { WorkerStatus } from '../util/WorkerUtil.mjs'; // Worker utilities

/**
 * Populate a date element.
 * 
 * @param {string} elementId - id of the element to populate
 * @param {number} ms - timestamp in milliseconds
 * @returns {string} browser‑locale date and time string 
 */
function populateDate(elementId, ms) {

    // Convert milliseconds to browser-locale date and time string
    const dateLocale = formatDateTime(ms);

    // Set element dataset value and text content
    document.getElementById(elementId).dataset.value = ms;
    document.getElementById(elementId).textContent = dateLocale;

    // Return browser‑locale date and time string
    return dateLocale;
}

/** Worker start button element. @type {HTMLButtonElement} */
const startButton = document.getElementById('start-worker');

/** Worker stop button element. @type {HTMLButtonElement} */
const stopButton = document.getElementById('stop-worker');

/** Data table element. @type {import('../util/ErrorUtil.mjs').ErrorUtilDataTableElement} */
const dataTable = document.getElementById('list');

/** Initial data payload. @type {import('../util/QueueUtil.mjs').QueueRequestDetail} */
let data = JSON.parse(document.getElementById('data').textContent);

// Handle data table row sort
dataTable.sort = handleSort;

// Set page title
page.titleElement.textContent = `View Job Queue Request - ${data.requestId}`;

// Set navbar highlight
page.navbarElement.current = data.requestId;

// Set request ID field
document.getElementById('request-id').textContent = data.requestId;

// Construct anchor element for filename
const filenameLink = document.createElement('a');
filenameLink.href = `/api/queue/${data.requestId}/download`;
filenameLink.textContent = data.filename;
document.getElementById('filename').appendChild(filenameLink);

// Convert version to date
const versionDateDisplay = document.getElementById('version-date');
const versionDate = formatDateTime(data.versionMs);
versionDateDisplay.dataset.value = data.versionMs;

// Check if wiki URL exists
if (typeof data.wiki === 'string') {

    // Construct anchor element for packageName
    const packageNameLink = document.createElement('a');
    const packageNameUriEncoded = encodeURIComponent(data.packageName);
    packageNameLink.href = `${data.wiki}${packageNameUriEncoded}`;
    packageNameLink.textContent = data.packageName;
    document.getElementById('package-name').appendChild(packageNameLink);

    // Construct anchor element for version
    const versionDatelink = document.createElement('a');
    versionDatelink.href = `${data.wiki}${packageNameUriEncoded}/${data.versionMs}`;
    versionDatelink.textContent = versionDate;
    versionDateDisplay.appendChild(versionDatelink);
}

else {

    // Populate package name cell
    document.getElementById('package-name').textContent = data.packageName;

    // Populate version date cell
    versionDateDisplay.textContent = versionDate;
}

/**
 * Render the page.
 */
function renderPage() {

    // Populate dates
    populateDate('submitted-date', data.submittedMs);
    populateDate('completed-date', data.completedMs);
    populateDate('unzip-start-date', data.unzip.startMs);
    populateDate('unzip-stop-date', data.unzip.stopMs);
    populateDate('report-start-date', data.report.startMs);
    populateDate('report-stop-date', data.report.stopMs);
    populateDate('move-start-date', data.move.startMs);
    populateDate('move-stop-date', data.move.stopMs);

    // Populate event duration
    document.getElementById('unzip-duration').textContent = getEventDuration(data.unzip);
    document.getElementById('report-duration').textContent = getEventDuration(data.report);
    document.getElementById('move-duration').textContent = getEventDuration(data.move);

    // Populate status, errors and attempts
    document.getElementById('job-status').textContent = data.jobStatus;
    document.getElementById('job-errors').textContent = data.errors.length;
    document.getElementById('job-attempts').textContent = data.attempts;

    // Set data table rows
    dataTable.rows = data.errors;

    // Handle data table field transformation
    dataTable.transform = handleTransform;

    // Render the data table
    dataTable.render();

    // Check if no errors
    if (data.errors.length === 0) {

        // Hide the data table
        document.getElementById('list').setAttribute('style', 'display: none;');
    }

    // Else error exists
    else {

        // Show the data table
        document.getElementById('list').removeAttribute('style');
    }

    // Compute if start worker button should be disabled
    const startDisabled = (
        data.jobStatus === WorkerStatus.ACTIVE ||
        data.jobStatus === WorkerStatus.COMPLETED
    );

    // Update start button
    disableButton(startButton, startDisabled);

    // Compute if stop worker button should be enabled
    const stopEnabled = (data.jobStatus === WorkerStatus.ACTIVE);

    // Update start button
    disableButton(stopButton, !stopEnabled);
}

/**
 * Send POST request helper.
 *
 * @param {string} url - endpoint to call
 * @returns {Promise<object>} json response
 */
async function post(url) {

    // Post URL
    const res = await fetch(url, { method: 'POST' });

    // Return JSON result
    return res.json();
}

// Click handler for start worker button
startButton.onclick = async function () {

    // Reject if disabled
    if (this.disabled) return;

    // Start the worker
    const json = await post(`/api/worker/start/${data.requestId}`);

    // Reject if error
    if (!json.requestId) {
        return alert(json.error);
    }

    // Reload page
    window.location.reload();
};

// Click handler for worker stop button
stopButton.onclick = async function () {

    // Reject if disabled
    if (this.disabled) return;

    // Stop the worker
    const json = await post(`/api/worker/stop/${data.requestId}`);

    // Reject if error
    if (!json.requestId) {
        return alert(json.error);
    }

    // Reload the page
    window.location.reload();
};

// Render the page with initial data
renderPage();

/**
 * Fetch the page data from the server.
 * 
 * @returns {Promise<import('../util/QueueUtil.mjs').QueueRequestDetail|null>} the fetched job queue request data or null if failed.
 */
async function fetchData() {

    // Get request data
    const res = await fetch(`/api/queue/${data.requestId}`);

    // Return null if request ID not found
    if (!res.ok) return null;

    // Else return fetched job queue request data
    return await res.json();
}

// Check if job status is ACTIVE to set up page refresh
if (data.jobStatus === WorkerStatus.ACTIVE) {

    // Set interval to refresh page every second
    const refreshIntervalId = setInterval(async () => {

        // Refresh the page
        const newData = await fetchData();

        // Check if refreshed data is valid
        if (newData) {

            // Update data
            data = newData;

            // Render the page with refreshed data
            renderPage();

            // Check if job status is no longer ACTIVE
            if (data.jobStatus !== WorkerStatus.ACTIVE) {

                // Clear the refresh interval
                clearInterval(refreshIntervalId);
            }
        }

        // Else refreshed data is null
        else {

            // Clear the refresh interval
            clearInterval(refreshIntervalId);

            /** Encoded package name. */
            const encodedPackageName = encodeURIComponent(data.packageName);

            // Navigate to show model page
            window.location.href = `/model/show/${encodedPackageName}/${data.versionMs}`;
        }

    }, 1000);
}