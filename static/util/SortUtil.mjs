/**
 * @module SortUtil.mjs
 * Sort utilities.
 */

/**
 * Sort array of objects by number in ascending order.
 * Mutates array.
 * 
 * @template T - the object type
 * 
 * @param {T[]} list - array of objects
 * @param {keyof T} key - sort key within element
 * @return {void}
 */
export function sortByNumberAscending(list, key) {

    // Sort ascending
    list.sort((a, b) => a[key] - b[key]);
}

/**
 * Sort array of objects by number in descending order.
 * Mutates array.
 * 
 * @template T - the object type
 * 
 * @param {T[]} list - array of objects
 * @param {keyof T} key - sort key within element
 * @return {void}
 */
export function sortByNumberDescending(list, key) {

    // Sort descending
    list.sort((a, b) => b[key] - a[key]);
}

/**
 * Sort array of objects by number in descending order.
 * Mutates array.
 * 
 * @template T - the object type
 * 
 * @param {T[]} list - array of objects
 * @param {keyof T} key - sort key within element
 * @param {boolean} [ascending] - true to sort ascending otherwise sort descending (default true)
 * @return {void}
 */
export function sortByNumber(list, key, ascending = true) {

    // Sort ascending if specified
    if (ascending) sortByNumberAscending(list, key);

    // Else sort descending
    else sortByNumberDescending(list, key);
}

/**
 * Sort array of objects by string in ascending order.
 * Mutates array.
 * 
 * @template T - the object type
 * 
 * @param {T[]} list - array of objects
 * @param {keyof T} key - sort key within element
 * @return {void}
 */
export function sortByStringAscending(list, key) {

    // Sort ascending
    list.sort((a, b) => a[key].localeCompare(b[key]));
}

/**
 * Sort array of objects by string in descending order.
 * Mutates array.
 * 
 * @template T - the object type
 * 
 * @param {T[]} list - array of objects
 * @param {keyof T} key - sort key within element
 * @return {void}
 */
export function sortByStringDescending(list, key) {

    // Sort descending
    list.sort((a, b) => b[key].localeCompare(a[key]));
}

/**
 * Sort array of objects by string in descending order.
 * Mutates array.
 * 
 * @template T - the object type
 * 
 * @param {T[]} list - array of objects
 * @param {keyof T} key - sort key within element
 * @param {boolean} [ascending] - true to sort ascending otherwise sort descending (default true)
 * @return {void}
 */
export function sortByString(list, key, ascending = true) {

    // Sort ascending if specified
    if (ascending) sortByStringAscending(list, key);

    // Else sort descending
    else sortByStringDescending(list, key);
}