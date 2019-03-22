const isPermissionEqualOrHigher = require('./require-permission-level').isPermissionEqualOrHigher;

/**
 * A middleware function that sets whether a query should be run with paranoid or not.
 * Proper usage example: bypassParanoid("admin")
 * 
 * @param {String} requiredPermission 
 */
module.exports = function(requiredPermission) {
    return (req, res, next) => {
        req.paranoid = !isPermissionEqualOrHigher(requiredPermission, req.user.role);
        next();
    };
};