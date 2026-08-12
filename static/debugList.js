// ------------------------------------------------------------
// Debug List Page Script
// ------------------------------------------------------------

/**
 * Utility: returns array of selected filenames
 */
function getSelectedFiles() {
    return Array.from(document.querySelectorAll('.fileCheck'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

/**
 * Utility: updates button states based on selection
 */
function updateButtonStates() {

    const selected = getSelectedFiles();

    const uploadBtn = document.getElementById('uploadBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    if (selected.length === 0) {
        // No files selected → Upload enabled, Delete disabled
        uploadBtn.disabled = false;
        uploadBtn.classList.remove('disabled');

        deleteBtn.disabled = true;
        deleteBtn.classList.add('disabled');

        // Upload should have focus first
        uploadBtn.focus();
    } else {
        // Files selected → Upload disabled, Delete enabled
        uploadBtn.disabled = true;
        uploadBtn.classList.add('disabled');

        deleteBtn.disabled = false;
        deleteBtn.classList.remove('disabled');

        // Delete should have focus
        deleteBtn.focus();
    }
}

/**
 * Select-all toggle
 */
document.getElementById('selectAll').onclick = function () {
    const checked = this.checked;
    document.querySelectorAll('.fileCheck').forEach(cb => cb.checked = checked);
    updateButtonStates();
};

/**
 * Individual checkbox change handler
 */
document.querySelectorAll('.fileCheck').forEach(cb => {
    cb.onclick = updateButtonStates;
});

/**
 * Upload button handler
 */
document.getElementById('uploadBtn').onclick = function () {
    // Navigate to transfer page
    window.location.href = '/debug/transfer';
};

/**
 * Delete button handler
 */
document.getElementById('deleteBtn').onclick = async function () {

    const selected = getSelectedFiles();

    if (selected.length === 0) {
        alert('No files selected');
        return;
    }

    const res = await fetch('/debug/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: selected })
    });

    const json = await res.json();

    // Reload list page
    window.location.href = '/debug';
};

// Initial state on page load
updateButtonStates();