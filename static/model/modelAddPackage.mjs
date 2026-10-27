/**
 * @file modelAddPackage
 * Client side behavior for modelAddPackage view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { validatePackageNameInput } from '../util/ModelUtil.mjs'; // Model utilities

/** Form element. @type {HTMLFormElement} */
const form = document.getElementById('form-add');

/** Package name input element. @type {HTMLInputElement} */
const packageNameInput = document.getElementById('package-name-input');

/** Save button element. @type {HTMLButtonElement} */
const saveButton = document.getElementById('save-button');

/**
 * Update Save button enabled state based only on emptiness.
 *
 * @returns {void}
 */
function updateSaveButtonState() {

    // Read trimmed package name
    const packageName = packageNameInput.value.trim();

    // Disable if empty, enable otherwise
    disableButton(saveButton, packageName.length === 0);
}

// Attach filename input handler
packageNameInput.oninput = () => {

    // Clear any custom error from browser bubble
    packageNameInput.setCustomValidity('');

    // Update save button state
    updateSaveButtonState();
};

/**
 * Form submit handler.
 *
 * @returns {Promise<void>}
 */
form.onsubmit = async function (event) {

    // Prevent browser submission
    event.preventDefault();

    // Reject invalid design package name
    if (!validatePackageNameInput(packageNameInput) || !form.reportValidity()) {
        return;
    }

    // Read trimmed design package name
    const packageName = packageNameInput.value.trim();

    try {

        // Send PUT request
        const res = await fetch('/api/model', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageName })
        });

        // Parse JSON
        const json = await res.json();

        // Reject failed upload
        if (!res.ok || json.error) {
            return alert(json.error || 'Save failed');
        }

        // Navigate back to model list
        window.location.href = '/model';

    } catch (err) {

        // Alert network error
        alert('Network error');
    }
};