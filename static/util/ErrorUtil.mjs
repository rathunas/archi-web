/**
 * @module ErrorUtil
 * Error handling utilities.
 */

import { formatDateTime } from './DateUtil.mjs'; // Date utilities
import { sortByNumber, sortByString } from './SortUtil.mjs'; // Sort utilities

/**
 * Data table element for error list.
 * 
 * @typedef {import('../components/AppDataTable.mjs').AppDataTable<
 *           import('./StatusUtil.mjs').StatusUtilErrorType>
 * } ErrorUtilDataTableElement
 */

/**
 * Handler for transforming a data table row into fields.
 *
 * @param {import('./StatusUtil.mjs').StatusUtilErrorType[]} rows - model package version errors
 * @param {Object.<string, HTMLElement>} fields - cloned field elements
 * @param {number} index - row index to transform
 * @returns {void}
 */
export function handleTransform(rows, fields, index) {

    // Get current row
    const row = rows[index];

    // Populate attempt cell
    fields['error-attempt'].dataset.value = row.attempt;
    fields['error-attempt'].textContent = row.attempt;

    // Populate modified date cell
    const timeDate = formatDateTime(row.timeMs);
    fields['error-date'].dataset.value = row.timeMs;
    fields['error-date'].textContent = timeDate;

    // Populate error message cell
    fields['error-message'].textContent = row.error;
}

/**
 * Handler for sorting rows in the data table.
 *
 * @param {import('./StatusUtil.mjs').StatusUtilErrorType[]} rows - model package version errors
 * @param {string} key - property name to sort on
 * @param {boolean} ascending - true if sort ascending
 * @returns {boolean} true if sort successful
 */
export function handleSort(rows, key, ascending = true) {

    // Sort by `error-attempt`
    if (key === 'error-attempt') {
        sortByNumber(rows, 'attempt', ascending);
        return true;
    }

    // Sort by `error-date`
    if (key === 'error-date') {
        sortByNumber(rows, 'timeMs', ascending);
        return true;
    }

    // Sort by `error-message`
    if (key === 'error-message') {
        sortByString(rows, 'error', ascending);
        return true;
    }

    // Else log error
    console.log(`Error: property key "${key}" is not sortable`);
    return false;
}