/**
 * @file modelShowPackage
 * Client side behaviour for modelShowPackage view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { formatDateTime } from '../util/DateUtil.mjs'; // Date utilities
import { validatePackageNameInput } from '../util/ModelUtil.mjs'; // Model utilities
import page from '../util/PageUtil.mjs'; // Page utilities

/**
 * Data table element for model package version timestamp list in milliseconds.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<number>
 * } ModelShowPackageVersionDataTableElement
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

    // Get current version timestamp in milliseconds
    const versionMs = rows[index];

    // Set selector value to version timestamp in milliseconds
    fields['list-selector'].value = versionMs;

    // Construct anchor element for version
    const versionDateLink = document.createElement('a');
    versionDateLink.href = `/model/show/${encodedPackageName}/${versionMs.toString(10)}`;
    versionDateLink.textContent = formatDateTime(versionMs);
    fields['version-date'].appendChild(versionDateLink);
    fields['version-date'].dataset.value = versionMs;
}

/**
 * Handler for sorting rows in the data table.
 *
 * @param {number[]} rows - model package version timestamp entries in milliseconds
 * @param {string} key - property name to sort on
 * @param {boolean} ascending - true if sort ascending
 * @returns {boolean} true if sort successful
 */
function handleSort(rows, key, ascending = true) {

    // Sort by `version-date`
    if (key === 'version-date') {

        // Sort ascending if specified
        if (ascending) rows.sort((a, b) => a - b);

        // Else sort descending
        else rows.sort((a, b) => b - a);

        return true;
    }

    // Else log error
    console.log(`Error: property key "${key}" is not sortable`);
    return false;
}

/** Package name input element. @type {HTMLInputElement} */
const packageNameInput = document.getElementById('package-name-input');

/** Package name label element. @type {HTMLLabelElement} */
const packageNameLabel = document.getElementById('package-name-label');

/** Master download link element. @type {HTMLAnchorElement} */
const masterLink = document.getElementById('master-link');

/** Rename button element. @type {HTMLButtonElement} */
const renameButton = document.getElementById('rename-button');

/** Delete button element. @type {HTMLButtonElement} */
const deleteButton = document.getElementById('delete-button');

/** Data table element. @type {ModelShowPackageVersionDataTableElement} */
const dataTable = document.getElementById('list');

/** Initial data payload. @type {import('../util/ModelUtil.mjs').ModelPackageNameDetail} */
const data = JSON.parse(document.getElementById('data').textContent);

// Set page title
page.titleElement.textContent = `View Model ` +
    `Design Package - ${data.packageName}`;

// Set navbar highlight
page.navbarElement.current = data.packageName;

// Set initial design package input value
packageNameInput.value = data.packageName;

/** Encoded design package name. */
const encodedPackageName = encodeURIComponent(data.packageName);

// Set master download link
masterLink.href = `/api/model/master/${encodedPackageName}/latest`;

// Check if wiki URL exists
if (typeof data.wiki === 'string') {

    // Construct anchor element for package name label
    const packageNameLink = document.createElement('a');
    packageNameLink.href = `${data.wiki}${encodedPackageName}`;
    packageNameLink.textContent = packageNameLabel.textContent;
    packageNameLabel.textContent = null;
    packageNameLabel.appendChild(packageNameLink);
}

// Set data table rows
dataTable.rows = data.versions;

// Handle data table field transformation
dataTable.transform = handleTransform;

// Handle data table row sort
dataTable.sort = handleSort;

// Wire selection change behaviour
dataTable.onSelectionChange = selected => {

    // Determine if any rows are selected
    const isSelected = selected.length > 0;

    // Delete enabled only when some selected
    disableButton(deleteButton, !isSelected);
};

// Render the data table
dataTable.render();

/**
 * Update Rename button enabled state.
 *
 * @returns {void}
 */
function updateRenameButtonState() {

    // Read trimmed new design package name
    const newPackageName = packageNameInput.value.trim();

    // Disable if empty or unchanged
    const shouldDisable = (
        newPackageName.length === 0 ||
        newPackageName === data.packageName
    );

    // Apply button state
    disableButton(renameButton, shouldDisable);
}

// Attach package name input handler
packageNameInput.oninput = () => {

    // Clear any custom error from browser bubble
    packageNameInput.setCustomValidity('');

    // Update rename button state
    updateRenameButtonState();
};

// Click handler for rename button
renameButton.onclick = async () => {

    // Reject invalid design package name
    if (!validatePackageNameInput(packageNameInput)) {
        return;
    }

    // Read trimmed new design package name
    const newPackageName = packageNameInput.value.trim();

    // Handle API fetch
    try {

        // Send PATCH request
        const res = await fetch('/api/model', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: data.packageName,
                target: newPackageName
            })
        });

        // Parse JSON
        const json = await res.json();

        // Reject failed rename
        if (!res.ok || json.error) {
            return alert(json.error || 'Rename failed');
        }

        // Navigate back to model list
        window.location.href = '/model';

    } catch (err) {

        // Alert network error
        alert('Network error');
    }
};

// Click handler for delete button
deleteButton.onclick = async () => {

    // Get selected design package versions
    const versions = dataTable.getSelectedData();

    // Reject empty selection
    if (versions.length === 0) {
        return alert('No model design package versions selected');
    }

    // Handle API delete
    try {

        // Send delete request
        const res = await fetch(`/api/model/${encodedPackageName}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ versions })
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