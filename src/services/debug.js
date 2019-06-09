const DEBUG = require('../../config').get().debug;

/**
 * Run the given function if and only if the DEBUG configuration value is TRUE.
 * Otherwise, no-op.
 * @param {Function} debugFunction The function to run if the DEBUG configuration value is TRUE
 */
function debug(debugFunction) {
    if (DEBUG) {
        return debugFunction();
    }
}

module.exports = debug;