const bcrypt = require('bcrypt');
const config = require('../../config').get().password;
const APIError = require('../APIError');

/**
 * Encrypts a plain-text password for storage in DB
 * @param {String} password
 * @returns {Promise} 
 */
function encrypt(password) {
    return bcrypt.hash(password, config.saltRounds)
        .catch(err => {
            throw APIError(500 || err.status, "Password Encryption Failed" || err.message);
       });
}

/**
 * Checks to see if the textPassword is the unencrypted form of the encryptedPassword (is the password correct)
 * @param {String} textPassword 
 * @param {String} encryptedPassword 
 * @returns {Promise}
 */
function compare(textPassword, encryptedPassword) {
    return bcrypt.compare(textPassword, encryptedPassword)
        .then(result => {
            //If the password was correct
            if (result) {
                return true;
            } else {
                throw {};
            }
        })
        .catch(err => {
            throw APIError(401, "Username / Password combination not found");
       });
}

module.exports = {
    encrypt,
    compare
};