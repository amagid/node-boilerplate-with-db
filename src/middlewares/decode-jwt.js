const Promise = require('bluebird');
const logger = require('../services/logger');
const jwt = require('../services/jwt');
const APIError = require('../APIError');

module.exports = decodeJWT;

function decodeJWT(req, res, next) {
    req.user = req.user || {};
    //If there's no JWT present, skip this.
    if (!req.headers.authorization || typeof req.headers.authorization !== 'string') {
        return next();
    }
    //Decode the JWT and save its user data if it is valid.
    return jwt.verify(req.headers.authorization.split(' ')[1])
        .then(userData => {
            Object.assign(req.user, userData);
            next();
        })
        .catch(err => {
            res.status(401).json({message: "Bad Authorization Token"});
       });
}