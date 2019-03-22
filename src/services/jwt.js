const jwt = require('jsonwebtoken');
const config = require('../../config');
const key = config.getKeys().privateKey;
const options = config.get().jwt;
const Promise = require('bluebird');
const jwtSign = Promise.promisify(jwt.sign);
const jwtVerify = Promise.promisify(jwt.verify);
const User = require('../models/User');

function sign(data) {
    data.signature++;
    return Promise.all([jwtSign(data, key, options), User.updateJWTSignature(data.id, data.signature)])
        .spread((jwt, counterResult) => {
            return jwt;
        });
}

function verify(token) {
    return jwtVerify(token, key)
        .then(decodedToken => {
            return Promise.all([decodedToken, User.checkJWTSignature(decodedToken.id, decodedToken.signature)]);
        })
        .spread((decodedToken, checkResult) => {
            if (checkResult) {
                return decodedToken;
            } else {
                throw APIError(401, 'Bad JWT Supplied', { 'reason': 'Invalid Counter Value' });
            }
        });
}

module.exports = {
    sign,
    verify
};