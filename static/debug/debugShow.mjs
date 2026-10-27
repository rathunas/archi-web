/**
 * @file debugShow
 * Client side behavior for debugShow view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { validateDebugFilenameInput } from '../util/DebugUtil.mjs'; // Debug utilities
import page from '../util/PageUtil.mjs'; // Page utilities

/**
 * Data payload for debugShow view.
 * 
 * @typedef DebugShowData
 * 
 * @property {string} filename - debug file name
 * @property {string} contents - debug file contents
 */

/** Initial data payload. @type {DebugShowData} */
const data = JSON.parse(document.getElementById('data').textContent);

// Set page title
page.titleElement.textContent = `View Debug File - ${data.filename}`;

// Set navbar highlight
page.navbarElement.current = data.filename;

/** File contents container. @type {HTMLDivElement} */
const contentsDiv = document.getElementById('contents');

// Inject contents
contentsDiv.textContent = data.contents;

/** Filename input element. @type {HTMLInputElement} */
const filenameInput = document.getElementById('filename-input');

// Set initial filename value
filenameInput.value = data.filename;

/** Rename button element. @type {HTMLButtonElement} */
const renameButton = document.getElementById('rename-button');

/**
 * Update Rename button enabled state.
 *
 * @returns {void}
 */
function updateRenameButtonState() {

    // Read trimmed new filename
    const newName = filenameInput.value.trim();

    // Disable if empty or unchanged
    const shouldDisable = (
        newName.length === 0 ||
        newName === data.filename
    );

    // Apply button state
    disableButton(renameButton, shouldDisable);
}

// Click handler for rename button
renameButton.onclick = async function () {

    // Reject invalid debug filename
    if (!validateDebugFilenameInput(filenameInput)) return;

    // Read trimmed new filename
    const newFilename = filenameInput.value.trim();

    // Handle API fetch
    try {

        // Send PATCH request
        const res = await fetch('/api/debug', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: data.filename,
                target: newFilename
            })
        });

        // Parse JSON
        const json = await res.json();

        // Reject failed rename
        if (!res.ok || json.error) {
            return alert(json.error || 'Rename failed');
        }

        // Navigate back to debug list
        window.location.href = '/debug';

    } catch (err) {

        // Alert network error
        alert('Network error');
    }
};

// Attach filename input handler
filenameInput.oninput = () => {

    // Clear any custom error from browser bubble
    filenameInput.setCustomValidity('');

    // Update rename button state
    updateRenameButtonState();
};