const Promise = require('bluebird');
const logger = require('../services/logger');
const protectedFields = require('../../config').get().protectedFields;
const APIError = require('../APIError');

module.exports = respond;

/**
 * The Respond middleware allows us to freely write synchronous or asynchronous
 * route handlers without having to ever worry about exceptions or Promise
 * rejections bubbling up and making it back to the client.
 * 
 * This middleware accepts a route handler as an arrow function, for example:
 * (req, res) => auth.login(req.body.username, req.body.password)
 * 
 * And then runs the handler safely within a try-catch block. The result from
 * the handler is then wrapped in a Promise. This way, if the handler is
 * asynchronous, the Promise will be unwrapped properly and all errors will be
 * handled internally by the Promise. If the handler is synchronous, its result
 * will still be properly handled AND if it fails to catch an exception, the
 * error will simply be caught here and wrapped in a Promise, rather than
 * bubbling up.
 * 
 * Nice, no?
 * @param {Function} handler The route handler as a middleware-style arrow function
 */
function respond(handler) {
    return (req, res, next) => {
        // Store the response Promise
        let response;
        try {
            // Attempt to handle the request with the given handler
            response = Promise.resolve(handler(req, res));
        } catch (err) {
            // If there is an uncaught exception (not a promise rejection), safely wrap it in a promise rejection
            response = Promise.reject(APIError(500, 'Unknown Error', err));
        }
        // Process the Promise-wrapped response
        return response
            .then(result => {
                _filterProtectedFields(req);
                logger.request({ message: "Request Handled Successfully", status: 200, additionalData: { route: req.originalUrl.split('?')[0], data: { query: Object.keys(req.query).length ? req.query : "No Query Data", params: Object.keys(req.params).length ? req.params : "No URL Param Data", body: Object.keys(req.body).length ? req.body : "No Body Data" }, user: !req.user || !Object.keys(req.user).length ? "Unidentified User" : req.user } });
                if (result && result.responseIsRedirect) {
                    res.redirect(result.redirectTo);
                } else {
                    res.status(200).json(result);
                }
            })
            .catch(error => {
                _filterProtectedFields(req);
                if (error.status === 500) {
                    logger.error({ message: error.message, status: error.status, additionalData: { rawError: error, route: req.originalUrl.split('?')[0], data: { query: Object.keys(req.query).length ? req.query : "No Query Data", params: Object.keys(req.params).length ? req.params : "No URL Param Data", body: Object.keys(req.body).length ? req.body : "No Body Data" }, user: !req.user || !Object.keys(req.user).length ? "Unidentified User" : req.user } });
                } else {
                    logger.warn({ message: error.message, status: error.status, additionalData: { rawError: error, route: req.originalUrl.split('?')[0], data: { query: Object.keys(req.query).length ? req.query : "No Query Data", params: Object.keys(req.params).length ? req.params : "No URL Param Data", body: Object.keys(req.body).length ? req.body : "No Body Data" }, user: !req.user || !Object.keys(req.user).length ? "Unidentified User" : req.user } });
                }
                res.status(error.status || error.statusCode || 500).json({ message: (error.status && error.status !== 500) ? error.message : 'Unknown Error', data: error.additionalData ? error.additionalData.send : undefined });
            })
            .catch(error => {
                logger.error({ message: error.message || "Unknown Error", status: error.status || error.statusCode || 500, additionalData: { rawError: error, route: req.originalUrl.split('?')[0], data: { query: Object.keys(req.query).length ? req.query : "No Query Data", params: Object.keys(req.params).length ? req.params : "No URL Param Data", body: Object.keys(req.body).length ? req.body : "No Body Data" }, user: !req.user || !Object.keys(req.user).length ? "Unidentified User" : req.user } });
                res.status(500).json({ message: 'Unknown Error' });
        });
    };
}

/**
 * Delete any sensitive fields such as passwords from the data before we log the request in server logs.
 * 
 * @param {Request} req 
 */
function _filterProtectedFields(req) {
    for (let field of protectedFields) {
        if (req.body[field]) { req.body[field] = "**PROTECTED FIELD**"; }
        if (req.query[field]) { req.query[field] = "**PROTECTED FIELD**"; }
        if (req.params[field]) { req.params[field] = "**PROTECTED FIELD**"; }
    }
}