/**
 * @file queueAdd
 * Client side behaviour for queueAdd view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { convertLocalTimestampToUTC, getLocalIsoTimestamp } from '../util/DateUtil.mjs'; // Date utilities
import { validateArchimateFilename, validatePackageName, validateVersionMs } from '../util/ModelUtil.mjs'; // Model utilities

/** Form element. @type {HTMLFormElement} */
const form = document.getElementById('form-add');

/** Filename input element. @type {HTMLInputElement} */
const fileInput = document.getElementById('file-input');

/** Filename display element. @type {HTMLSpanElement} */
const fileDisplay = document.getElementById('file-display');

/** Package name input element. @type {HTMLInputElement} */
const packageNameInput = document.getElementById('package-name-input');

/** Version date input element. @type {HTMLInputElement} */
const versionDateInput = document.getElementById('version-date-input');

/** File button element. @type {HTMLButtonElement} */
const fileButton = document.getElementById('file-button');

/** Submit button element. @type {HTMLButtonElement} */
const submitButton = document.getElementById('submit-button');

/** Reset button element. @type {HTMLButtonElement} */
const resetButton = document.getElementById('reset-button');

/**
 * Updates submit button state based on field validation.
 *
 * @returns {void}
 */
function updateSubmitButtonState() {

    // Get selected file or undefined
    const file = fileInput.files[0];

    // Get package name value
    const packageName = packageNameInput.value;

    // Get version date value
    const versionDate = versionDateInput.value;

    // Determine if all fields have values
    const allValues = (
        file !== undefined &&
        packageName !== '' &&
        versionDate !== ''
    );

    // Enable or disable submit button
    disableButton(submitButton, !allValues);
}

// Attach file input change handler
fileInput.onchange = () => {

    /** Chosen file or undefined. @type {File|undefined} */
    const file = fileInput.files[0];

    // Update file display
    fileDisplay.textContent = file === undefined
        ? 'No file chosen'
        : file.name;

    // Update submit button state
    updateSubmitButtonState();
};

// Attach package name input handler
packageNameInput.oninput = () => {

    // Clear any custom error from browser bubble
    packageNameInput.setCustomValidity('');

    // Update submit button state
    updateSubmitButtonState();
};

// Attach version date input handler
versionDateInput.oninput = () => {

    // Clear any custom error from browser bubble
    versionDateInput.setCustomValidity('');

    // Update submit button state
    updateSubmitButtonState();
};

// Attach file button handler
fileButton.onclick = () => {

    // Trigger file input click
    fileInput.click();
};

// Attach reset button handler
resetButton.onclick = () => {

    // Call form reset
    form.reset();

    // Reset file display
    fileDisplay.textContent = 'No file chosen';

    // Reset version date
    versionDateInput.value = getLocalIsoTimestamp();

    // Update submit button state
    updateSubmitButtonState();
};

/**
 * Form submit handler.
 *
 * @returns {Promise<void>}
 */
form.onsubmit = async function (event) {

    // Prevent browser submission
    event.preventDefault();

    /** Chosen file or undefined. @type {File|undefined} */
    const file = fileInput.files[0];

    // Reject if file missing
    if (file === undefined) {
        return alert('No file chosen');
    }

    // Reject if invalid archimate filename format
    try { validateArchimateFilename(file.name) }
    catch (err) { return alert(err.message); }

    // Declare package name value
    let packageName;

    // Handle package name validation
    try {

        // Validate package name
        packageName = validatePackageName(packageNameInput.value);
    }

    catch (err) {

        // Feed custom error into browser bubble
        packageNameInput.setCustomValidity(err.message);

        // Show bubble immediately
        return packageNameInput.reportValidity();
    }

    // Declare version timestamp in milliseconds
    let versionMs;

    // Handle version date validation
    try {

        // Validate version date
        versionMs = validateVersionMs(versionDateInput.valueAsNumber);
    }

    catch (err) {

        // Feed custom error into browser bubble
        versionDateInput.setCustomValidity(err.message);

        // Show bubble immediately
        return versionDateInput.reportValidity();
    }

    // Attempt to submit job request
    try {

        // Build form data
        const data = new FormData();
        data.append('file', file);
        data.append('packageName', packageName);
        data.append('versionMs', convertLocalTimestampToUTC(versionMs));

        // Send PUT request
        const res = await fetch('/api/queue', {
            method: 'PUT',
            body: data
        });

        // Parse JSON response
        const json = await res.json();

        // Reject failed file upload
        if (!res.ok) {
            return alert(json.error || 'Job request submission failed');
        }

        // Navigate back to queue
        window.location.href = '/queue';

    } catch (err) {

        // Alert network error
        alert('Network error');
    }
}

// Set initial version date
versionDateInput.value = getLocalIsoTimestamp();