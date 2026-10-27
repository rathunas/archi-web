/**
 * @file debugAdd
 * Client side behavior for debugAdd view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { validateDebugFilenameInput } from '../util/DebugUtil.mjs'; // Debug utilities

/** Form element. @type {HTMLFormElement} */
const form = document.getElementById('form-add');

/** Filename input element. @type {HTMLInputElement} */
const filenameInput = document.getElementById('filename-input');

/** File contents input element. @type {HTMLTextAreaElement} */
const contentsInput = document.getElementById('contents-input');

/** Save button element. @type {HTMLButtonElement} */
const saveButton = document.getElementById('save-button');

/**
 * Update Save button enabled state based only on emptiness.
 *
 * @returns {void}
 */
function updateSaveButtonState() {

    // Read trimmed filename
    const filename = filenameInput.value.trim();

    // Disable if empty, enable otherwise
    disableButton(saveButton, filename.length === 0);
}

// Attach filename input handler
filenameInput.oninput = () => {

    // Clear any custom error from browser bubble
    filenameInput.setCustomValidity('');

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

    // Reject invalid debug filename
    if (!validateDebugFilenameInput(filenameInput) || !form.reportValidity()) {
        return;
    }

    // Read trimmed filename
    const filename = filenameInput.value.trim();

    // Read contents
    const contents = contentsInput.value;

    try {

        // Send PUT request
        const res = await fetch('/api/debug', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, contents })
        });

        // Parse JSON
        const json = await res.json();

        // Reject failed upload
        if (!res.ok || json.error) {
            return alert(json.error || 'Save failed');
        }

        // Navigate back to debug list
        window.location.href = '/debug';

    } catch (err) {

        // Alert network error
        alert('Network error');
    }
};