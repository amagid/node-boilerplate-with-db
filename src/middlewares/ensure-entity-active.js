const Promise = require('bluebird');
const Company = require('../models/Company');
const isPermissionEqualOrHigher = require('./require-permission-level').isPermissionEqualOrHigher;

/**
 * A middleware function that checks to make sure the entity being accessed has not been deleted.
 * Proper usage example: (req, res, next) => { ensureEntityActive(req, res, next, "company", path.to.company.id); }
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

        return User.exists(entityId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: "User Not Found" });
                }
                next();
            })
            .catch(err => {
                return res.status(err.status || 500).json({message: err.message || "Error"});
           });

    }
};