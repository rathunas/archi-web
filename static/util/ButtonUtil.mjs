/**
 * @module ButtonUtil
 * Button state utilities.
 */

/**
 * Set a button disable state.
 *
 * @param {HTMLElement} button - the button element
 * @param {boolean} disabled - true to disable, otherwuse false to enable
 */
export function disableButton(button, disabled) {

    // Set button disabled state
    button.disabled = disabled;

    // Toggle CSS class
    button.classList.toggle('disabled', disabled);
}