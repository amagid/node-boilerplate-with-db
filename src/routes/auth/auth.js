const Promise = require('bluebird');
const APIError = require('../../APIError');
const User = require('../../services/user');

module.exports = {
    login,
    verifyJWT,
    requestPasswordReset,
    verifyToken,
    completePasswordReset,
    completeSignup,
    updatePassword
};

function login(username, password) {
    return User.login(username, password);
}

function verifyJWT(userData) {
    //Only need to check this because decodeJWT middleware will not add user data to req.user unless JWT is valid.
    if (userData && typeof userData.id === 'number') {
        return { valid: true };
    } else {
        return Promise.reject(APIError(401, "Bad JWT Supplied"));
    }
}

function requestPasswordReset(username) {
    return User.requestPasswordReset(username);
}

function verifyToken(token, verificationType) {
    return User.verifyToken(token, verificationType);
}

function completePasswordReset(token, newPassword) {
    return User.completePasswordReset(token, newPassword);
}

function completeSignup(token, signupData) {
    return User.completeSignup(token, signupData);
}

function updatePassword(userId, oldPassword, newPassword, newPasswordConfirm) {
    return User.updatePassword(userId, oldPassword, newPassword, newPasswordConfirm);
}