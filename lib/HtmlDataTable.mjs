/**
 * @module HtmlTableUtil
 * HTML data table rendering utilities.
 */

/**
 * Return width for a data table column.
 * 
 * @callback DataTableWidthFunction
 * @param {DataTableOptions} options - options for rendering this data table
 * @param {number} columnIndex - the column position being rendered
 * @returns {string} html width string
 */

/**
 * Render a data table heading.
 * 
 * @callback DataTableHeadingFunction
 * @param {DataTableOptions} options - options for rendering this data table
 * @param {number} columnIndex - the column position being rendered
 * @returns {string} rendered html string
 */

/**
 * Render a data table cell.
 * 
 * @callback DataTableCellFunction
 * @param {DataTableOptions} options - options for rendering this data table
 * @param {number} columnIndex - the column position being rendered
 * @param {number} rowIndex - the row position being rendered
 * @returns {string} rendered html string
 */

/**
 * Options for rendering a data table column.
 * 
 * @typedef {Object} DataTableColumnOptions
 * @property {string} key - column key used to extract row data
 * @property {DataTableWidthFunction|string} width - function or string width
 * @property {DataTableHeadingFunction|string} heading - function or string heading
 * @property {DataTableCellFunction} cell - function to render cell
 */

/**
 * Options for a data table row.
 * 
 * @typedef {Object} DataTableRowOptions
 * @property {string} id - unique row identifier
 * @property {Object<string, string>} data - key/value data for each column
 */

/**
 * Options for rendering a data table.
 * 
 * @typedef {Object} DataTableOptions
 * @property {string} id - unique DOM id for the table
 * @property {string} cssClass - base CSS class for grid rows
 * @property {boolean} checkbox - whether to include a checkbox column
 * @property {DataTableColumnOptions[]} columns - options for rendering columns
 * @property {DataTableRowOptions[]} rows - array of data rows
 */

/**
 * Render a data table.
 * 
 * @param {DataTableOptions} options - options for rendering this data table
 * @returns {string} rendered html string
 */
export function render(options) {

    /** @type {string[]} */
    const widths = [];

    // Add checkbox column if enabled
    if (options.checkbox) widths.push('40px');

    // Add widths for each column
    widths.push(...options.columns.map((column, index) =>
        typeof column.width === 'function'
            ? column.width(options, index)
            : column.width
    ));

    // Build grid-template-columns style string
    const gridStyle = `grid-template-columns:${widths.join(' ')};`;

    // Render header row
    const headerHtml = `
        <div class="${options.cssClass} header" style="${gridStyle}">
            ${options.checkbox ? `
            <div class="${options.cssClass}-check">
                <input type="checkbox" id="selectAll">
            </div>` : ''}
            ${options.columns.map((column, index) =>
        typeof column.heading === 'function'
            ? column.heading(options, index)
            : `<span>${column.heading}</span>`
    ).join('')}
        </div>
    `;

    // Render data rows
    const rowsHtml = options.rows.map((row, rowIndex) => `
        <div class="${options.cssClass} row" style="${gridStyle}">
            ${options.checkbox ? `
            <div class="${options.cssClass}-check">
                <input type="checkbox" class="rowCheck" value="${row.id}">
            </div>` : ''}
            ${options.columns.map((column, columnIndex) =>
        column.cell(options, columnIndex, rowIndex)
    ).join('')}
        </div>
    `).join('');

    // Wrap in container
    return `
        <div id="${options.id}">
            ${headerHtml}
            ${rowsHtml}
        </div>
    `;
}

/**
 * Options for defining a standard column.
 * 
 * @typedef {Object} DataTableColumnDefinitionOptions
 * @property {string} key - column key used to extract row data
 * @property {string} width - column width
 * @property {string} heading - column heading label
 */

/**
 * Helper function to create standard column definitions.
 * 
 * @param {DataTableColumnDefinitionOptions} options - column definition options
 * @returns {DataTableColumnOptions} column options
 */
export function defineColumn(options) {

    return {
        key: options.key,

        width: () => options.width,

        heading: () => `<span>${options.heading}</span>`,

        cell: (tableOptions, columnIndex, rowIndex) => {
            const row = tableOptions.rows[rowIndex];
            const columnKey = tableOptions.columns[columnIndex].key;
            const value = row.data[columnKey] ?? '';
            return `<span>${value}</span>`;
        }
    };
}