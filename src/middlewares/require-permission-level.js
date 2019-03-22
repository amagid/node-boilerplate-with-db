const Promise = require('bluebird');
const logger = require('../services/logger');

module.exports = {
    admin: requirePermissionLevel('admin'),
    isPermissionEqualOrHigher
};

/**
 * Returns a middleware function that checks to see if the user has the required permission level.
 * 
 * @param {String} level 
 * @returns {Function}
 */
function requirePermissionLevel(level) {
    return (req, res, next) => {

        if (!req.user || !req.user.role) {
            logger.warn({ message: 'Unauthenticated User Attempted To Access API', status: 401, additionalData: { route: req.originalUrl } });
            return res.status(401).json({ message: 'No Authorization Token Found. Please log in and try again' });
        }

        if (isPermissionEqualOrHigher(level, req.user.role)) {
            next();
        } else {
            logger.warn({ message: 'User Attempted To Access Forbidden Resource', status: 403, additionalData: { route: req.originalUrl, query: req.query, params: req.params, body: req.body, user: req.user, requiredPermissionLevel: level } });
            return res.status(403).json({ message: 'You do not have permission to access that' });
        }
    };
}

/**
 * Checks to see if the given user's permission level is equal to or higher than the required permission level.
 * 
 * @param {String} level 
 * @param {String} userPermission 
 * @returns {Boolean}
 */
function isPermissionEqualOrHigher(level, userPermission) {
    if (userPermission === 'admin') {
        return true;
    // } else if (userPermission === 'user') {
    //     return level === 'user';
    } else {
        logger.error(`Invalid Permission Level: "${userPermission}"`, 400, { suppliedPermissionLevel: userPermission, requiredPermissionLevel: level });
        return false;
    }
}