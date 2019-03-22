const { validationResult } = require('express-validator/check');
const logger = require('../services/logger');

module.exports = validate;

function validate(validatorArray) {
    return [validatorArray, checkValidationResult];
}

function checkValidationResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn({ message: "Bad Data Supplied", status: 400, additionalData: errors.mapped() });
        return res.status(400).json({ message: "Bad Data", errors: errors.mapped() });
    }
    return next();
}