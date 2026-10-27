/**
 * @file modelShowVersion
 * Client side behaviour for modelShowPackage view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { convertLocalTimestampToUTC, formatDateTime, getLocalIsoTimestamp } from '../util/DateUtil.mjs'; // Date utilities
import { handleSort, handleTransform } from '../util/ErrorUtil.mjs';
import { validateVersionMs } from '../util/ModelUtil.mjs'; // Model utilities
import page from '../util/PageUtil.mjs'; // Page utilities
import { getEventDuration } from '../util/StatusUtil.mjs'; // Status file utilities

/**
 * Data table element for model package version errors.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<
 *           import('../util/StatusUtil.mjs'.StatusUtilErrorType>
 * } ModelShowVersionErrorDataTableElement
 */

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

/** Package name display element. @type {HTMLSpanElement} */
const packageNameDisplay = document.getElementById('package-name');

/** Package name label element. @type {HTMLLabelElement} */
const packageNameLabel = document.getElementById('package-name-label');

/** Version date input element. @type {HTMLInputElement} */
const versionDateInput = document.getElementById('version-date-input');

/** Version date label element. @type {HTMLLabelElement} */
const versionDateLabel = document.getElementById('version-date-label');

/** Rename button element. @type {HTMLButtonElement} */
const renameButton = document.getElementById('rename-button');

/** Navigation bar package name link element. @type {HTMLAnchorElement} */
const navbarPackageNameLink = document.getElementById('navbar-package-name-link');

/** Job step 1 heading link element. @type {HTMLAnchorElement} */
const step1Link = document.getElementById('step-1-link');

/** Job step 2 heading link element. @type {HTMLAnchorElement} */
const step2Link = document.getElementById('step-2-link');

/** Data table element. @type {ModelShowVersionErrorDataTableElement} */
const dataTable = document.getElementById('list');

/** Initial data payload. @type {import('../util/ModelUtil.mjs').ModelVersionDetail} */
const data = JSON.parse(document.getElementById('data').textContent);

/** Encoded design package name. */
const encodedPackageName = encodeURIComponent(data.packageName);

/** Original encoded design package version timestamp in milliseconds. */
let versionString = data.versionMs.toString(10);

// Set page title
page.titleElement.textContent = `View Model ` +
    `Design Package - ${data.packageName} - ` +
    `Version ${versionString}`;

// Set navbar package name
navbarPackageNameLink.href = `/model/show/${encodedPackageName}`;
navbarPackageNameLink.textContent = data.packageName;

// Set navbar highlight
page.navbarElement.current = versionString;

// Set design package name display field
packageNameDisplay.textContent = data.packageName;

// Set initial design package version date input value
const versionDate = new Date(data.versionMs);
versionDateInput.value = getLocalIsoTimestamp(versionDate);

// Check if wiki URL exists
if (typeof data.wiki === 'string') {

    // Construct anchor element for package name label
    const packageNameLink = document.createElement('a');
    packageNameLink.href = `${data.wiki}${encodedPackageName}`;
    packageNameLink.textContent = packageNameLabel.textContent;
    packageNameLabel.textContent = null;
    packageNameLabel.appendChild(packageNameLink);

    // Construct anchor element for version date label
    const versionDateLink = document.createElement('a');
    versionDateLink.href = `${data.wiki}${encodedPackageName}/${versionString}`;
    versionDateLink.textContent = versionDateLabel.textContent;
    versionDateLabel.textContent = null;
    versionDateLabel.appendChild(versionDateLink);
}

// Populate request ID display field
document.getElementById('request-id').textContent = data.requestId;

// Construct anchor element for filename
const filenameLink = document.createElement('a');
filenameLink.href = `/api/model/${encodedPackageName}/${versionString}/model.archimate`;
filenameLink.textContent = data.filename;
document.getElementById('filename').appendChild(filenameLink);

// Update step link locations
step1Link.href = `/api/model/${encodedPackageName}/${versionString}/archimate/model.xml`;
step2Link.href = `/api/model/${encodedPackageName}/${versionString}/report/index.html`;

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

// Populate errors and attempts
document.getElementById('job-errors').textContent = data.errors.length;
document.getElementById('job-attempts').textContent = data.attempts;

// Set data table rows
dataTable.rows = data.errors;

// Handle data table field transformation
dataTable.transform = handleTransform;

// Handle data table row sort
dataTable.sort = handleSort;

// If job had errors, remove the hidden list style
if (data.errors.length > 0) document.getElementById('list').removeAttribute('style');

// Render the data table
dataTable.render();

/**
 * Update Rename button enabled state.
 *
 * @returns {void}
 */
function updateRenameButtonState() {

    // Read new design package version timestamp in milliseconds
    const newVersionMs = versionDateInput.valueAsNumber;

    // Disable if empty or unchanged
    const shouldDisable = (
        Number.isNaN(newVersionMs) ||
        convertLocalTimestampToUTC(newVersionMs) === data.versionMs
    );

    // Apply button state
    disableButton(renameButton, shouldDisable);
}

// Attach version date input handler
versionDateInput.oninput = () => {

    // Clear any custom error from browser bubble
    versionDateInput.setCustomValidity('');

    // Update rename button state
    updateRenameButtonState();
};

// Click handler for rename button
renameButton.onclick = async () => {

    /** New design package version timestamp. */
    let newVersionMs = NaN;

    // Validate design package version timestamp using custom logic
    try {

        // Run custom design package name validator
        newVersionMs = validateVersionMs(versionDateInput.valueAsNumber);

        // Clear browser validation error
        versionDateInput.setCustomValidity('');

    } catch (err) {

        // Feed custom error into browser bubble
        versionDateInput.setCustomValidity(err.message);

        // Show bubble immediately and return
        versionDateInput.reportValidity();
        return;
    }

    // Handle API fetch
    try {

        // Convert to UTC
        newVersionMs = convertLocalTimestampToUTC(newVersionMs);

        // Send PATCH request
        const res = await fetch(`/api/model/${encodedPackageName}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: data.versionMs,
                target: newVersionMs
            })
        });

        // Parse JSON
        const json = await res.json();

        // Reject failed rename
        if (!res.ok || json.error) {
            return alert(json.error || 'Rename failed');
        }

        // Navigate back to show package list
        window.location.href = `/model/show/${encodedPackageName}`;

    } catch (err) {

        // Alert network error
        alert('Network error');
    }
};