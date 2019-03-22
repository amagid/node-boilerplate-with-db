const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const regexes = require('../../../config').get().regexes;

const login = [
    check('username').exists().isString(),
    check('password').exists().isString().matches(regexes.password),

    sanitize('username').toString(),
    sanitize('password').toString()
];

const requestPasswordReset = [
    check('username').exists().isString(),

    sanitize('username').toString()
];

const verifyToken = [
    check('token').exists().isString().matches(regexes.token),

    sanitize('token').toString()
];

const completePasswordReset = [
    check('newPassword').exists().isString().matches(regexes.password),
    check('token').exists().isString().matches(regexes.token),

    sanitize('newPassword').toString(),
    sanitize('token').toString()
];

const completeSignup = [
    check('fname').exists().isString(),
    check('lname').exists().isString(),
    check('smsNumber').optional().isString().matches(regexes.phoneNumber),
    check('pushNotifId').optional().isString(),
    check('password').optional().isString().matches(regexes.password),
    check('token').exists().isString().matches(regexes.token),

    sanitize('fname').toString(),
    sanitize('lname').toString(),
    sanitize('smsNumber').toString(),
    sanitize('pushNotifId').toString(),
    sanitize('password').toString(),
];

const updatePassword = [
    check('userId').exists().isInt(),
    check('oldPass').exists().isString(),
    check('newPass').exists().isString(),
    check('newPassConfirm').exists().isString(),

    sanitize('userId').toInt(),
    sanitize('oldPass').toString(),
    sanitize('newPass').toString(),
    sanitize('newPassConfirm').toString()
];

const updateOwnPassword = [
    check('oldPass').exists().isString(),
    check('newPass').exists().isString(),
    check('newPassConfirm').exists().isString(),

    sanitize('oldPass').toString(),
    sanitize('newPass').toString(),
    sanitize('newPassConfirm').toString()
];

module.exports = {
    login,
    requestPasswordReset,
    verifyToken,
    completePasswordReset,
    completeSignup,
    updatePassword,
    updateOwnPassword
};