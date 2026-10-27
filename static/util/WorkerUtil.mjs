/**
 * @module WorkerUtil
 * Worker utilities.
 */

/**
 * Worker status values.
 */
export const WorkerStatus = {
    INACTIVE: 'Inactive',   // inactive, not yet started
    ACTIVE: 'Active',       // worker thread active
    COMPLETED: 'Completed', // worker completed successfully
    ABORTED: 'Aborted',     // worker partially finished
    FAILED: 'Failed'        // worker failed with error
};

/**
 * A worker status value.
 * 
 * @typedef {typeof WorkerStatus[keyof typeof WorkerStatus]} WorkerStatusValue
 */