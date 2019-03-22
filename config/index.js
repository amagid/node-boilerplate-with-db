'use strict';
const dev = require('./development');
const prod = require('./production');
const test = require('./testing');
const keys = require('./keys');
dev.regexes = require('./regexes-dev');
prod.regexes = require('./regexes-prod');

/**
 * Gets the relevant configuration values for the current environment. The
 * current environment is specified by the APP_ENV environment variable. This
 * method also optionally applies special testing configuration values to the
 * retrieved configuration if the APP_TESTING variable is set to 'true'.
 * 
 * @return {Object} The current configuration.
 */
function get() {
    if (process.env.APP_ENV === 'development') {
        return Object.assign({}, dev, process.env.APP_TESTING === 'true' ? test : {});
    } else if (process.env.APP_ENV === 'production') {
        return Object.assign({}, prod, process.env.APP_TESTING === 'true' ? test : {});
    } else {
        return Object.assign({}, dev, process.env.APP_TESTING === 'true' ? test : {});
    }
}

module.exports = {
    get,
    getKeys: keys.getKeys
};