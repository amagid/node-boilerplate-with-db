const Promise = require('bluebird');
const User = require('../models/User');
const isPermissionEqualOrHigher = require('./require-permission-level').isPermissionEqualOrHigher;

/**
 * A middleware function that checks to make sure the current user has permission over the entity which they are trying to access.
 * Proper usage example: (req, res, next) => { ensureOwnership(req, res, next, "panel", path.to.panel.id); }
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 * @param {String} entityType 
 * @param {Number} entityId 
 */
module.exports = function(req, res, next, entityType, entityId) {
    //If the user is an admin, bypass the whole process
    if (req.user.role === "admin") {
        return next();
    }

    if (entityType === 'user') {

        return Promise.all([User.findById(req.user.id), User.findById(entityId)])
            .spread((currentUser, accessUser) => {
                if (!currentUser || !accessUser) {
                    return res.status(404).json({ message: "User Not Found" });
                }
                if (!isPermissionEqualOrHigher('admin', currentUser.role)) {
                    return res.status(403).json({ message: "You do not have permission to do that" });
                }
                next();
            })
            .catch(err => {
                return res.status(err.status || 500).json({message: err.message || "Error"});
            });
    }
};