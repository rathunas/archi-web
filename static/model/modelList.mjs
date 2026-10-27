/**
 * @file modelList
 * Client side behaviour for modelList view.
 */

import { disableButton } from '../util/ButtonUtil.mjs'; // Button utilities
import { sortByNumber, sortByString } from '../util/SortUtil.mjs'; // Sort utilities

/**
 * Data table element for model package name list.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<
 *           import('../util/ModelUtil.mjs').ModelPackageNameEntry>
 * } ModelListDataTableElement
 */

/**
 * Handler for transforming a data table row into fields.
 *
 * @param {import('../util/ModelUtil.mjs').ModelPackageNameEntry[]} rows - model package name entries
 * @param {Object.<string, HTMLElement>} fields - cloned field elements
 * @param {number} index - row index to transform
 * @returns {void}
 */
function handleTransform(rows, fields, index) {

    // Get current row
    const row = rows[index];

    // Set selector value to packageName
    fields['list-selector'].value = row.packageName;

    // Construct anchor element for packageName
    const packageNameLink = document.createElement('a');
    const packageNameUriEncoded = encodeURIComponent(row.packageName);
    packageNameLink.href = `/model/show/${packageNameUriEncoded}`;
    packageNameLink.textContent = row.packageName;
    fields['package-name'].appendChild(packageNameLink);

    // Populate version count
    fields['version-count'].dataset.value = row.versions;
    fields['version-count'].textContent = row.versions;
}

/**
 * Handler for sorting rows in the data table.
 *
 * @param {import('../util/ModelUtil.mjs').ModelPackageNameListEntry[]} rows - model package entry list
 * @param {string} key - property name to sort on
 * @param {boolean} ascending - true if sort ascending
 * @returns {boolean} true if sort successful
 */
function handleSort(rows, key, ascending = true) {

    // Sort on `package-name`
    if (key === 'package-name') {
        sortByString(rows, 'packageName', ascending);
        return true;
    }

    // Sort by `version-count`
    if (key === 'version-count') {
        sortByNumber(rows, 'versions', ascending);
        return true;
    }

    // Else log error
    console.log(`Error: property key "${key}" is not sortable`);
    return false;
}

/** Initialize. */
window.document.addEventListener('DOMContentLoaded', () => {

    /** Add button element. @type {HTMLButtonElement} */
    const addButton = document.getElementById('add-button');

    /** Delete button element. @type {HTMLButtonElement} */
    const deleteButton = document.getElementById('delete-button');

    /** Data table element. @type {ModelListDataTableElement} */
    const dataTable = document.getElementById('list');

    /** Initial data payload. @type {import('../util/ModelUtil.mjs').ModelPackageNameEntry} */
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
        window.location.href = '/model/add';
    };

    // Click handler for delete button
    deleteButton.onclick = async () => {

        // Get selected rows
        const selectedRows = dataTable.getSelectedData();

        // Reject empty selection
        if (selectedRows.length === 0) {
            return alert('No model design packages selected');
        }

        // Extract package names
        const packageNames = selectedRows.map(rows => rows.packageName);

        // Handle API delete
        try {

            // Send delete request
            const res = await fetch('/api/model', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageNames })
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
});