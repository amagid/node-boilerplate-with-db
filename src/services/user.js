const jwt = require('./jwt');
const password = require('./password');
const config = require('../../config').get();
const User = require('../models/User');
const Promise = require('bluebird');
const APIError = require('../APIError');
const shortId = require('shortid');
const mailer = require('./mailer');
const isPermissionEqualOrHigher = require('../middlewares/require-permission-level').isPermissionEqualOrHigher;

function login(username, pass) {
    return User.findByUsername(username)
        .then(userData => {
            if (userData.token) {
                throw APIError(400, "Unverified User");
            }
            return Promise.all([userData, password.compare(pass, userData.password)]);
        })
        .spread((userData, passwordValid) => {
            if (passwordValid) {
                return generateJWT(userData);
            } else {
                throw {};
            }
        })
        .catch(err => {
            throw APIError(400, "Username / Password Combination Not Found");
       });
}

function generateJWT(userData) {
    const user = {
        id: userData.dataValues.id,
        role: userData.dataValues.role,
        signature: userData.dataValues.signature
    };

    return jwt.sign(user)
        .then(token => {
            return { token }
       });
}

function requestPasswordReset(username) {
    const resetToken = shortId.generate();
    return User.findByUsername(username, true)
        .then(userData => {
            if (!userData) {
                throw APIError(404, 'User Not Found');
            } else if (!userData.password) {
                throw APIError(400, 'User Not Verified')
            } else {
                return Promise.all([userData, userData.update({ token: resetToken, password: null })]);
            }
        })
        .spread((userData, updateResult, invalidationResult) => {
            if (!updateResult) {
                throw APIError(404, 'User Not Found', { reason: 'User Reset Token Update Failed' });
            }
            return mailer.sendPasswordResetEmail(userData.email, userData.fname, userData.token);
        })
        .catch(err => {
            throw APIError(err.status || 500, err.message || 'Password Reset Failed', err);
        });
}

function verifyToken(token, verificationType) {
    return User.findByToken(token)
        .then(() => {
            if (verificationType === 'signup') {
                return {
                    responseIsRedirect: true,
                    redirectTo: config.urls.uiBaseUrl + 'complete-signup/?token=' + token
                };
            } else if (verificationType === 'password-reset') {
                return {
                    responseIsRedirect: true,
                    redirectTo: config.urls.uiBaseUrl + 'complete-password-reset/'
                };
            } else {
                return { valid: true };
            }
        })
        .catch(err => {
            if (verificationType === 'signup') {
                return {
                    responseIsRedirect: true,
                    redirectTo: config.urls.uiBaseUrl + 'complete-signup/?invalidToken=true'
                };
            }
            throw APIError(400, "Invalid Token", err);
        });
}

function completePasswordReset(token, newPassword) {
    return password.encrypt(newPassword)
        .then(hash => {
            return User.update({ password: hash, token: null }, { where: { token } });
        })
        .then(result => {
            return { message: "Password Updated Successfully" };
        })
        .catch(err => {
            //TODO: More detailed error handling
            throw APIError(err.status || 500, err.message || "Password Update Failed", err);
        });
}

function createUser(userData, currentUser) {
    const { fname, lname, username, pass, smsNumber, email, pushNotifId, role } = userData;
    const verificationToken = shortId.generate();
    if (currentUser.role !== "admin") {
        return Promise.reject(APIError(403, "Only Admins can create Users"));
    }
    if (role && currentUser.role && currentUser.role !== "admin" && !isPermissionEqualOrHigher(role, currentUser.role)) {
        return Promise.reject(APIError(403, "You may not give a User more permission than you yourself have"));
    }
    return Promise.all([pass ? password.encrypt(pass) : Promise.resolve(null)])
        .spread((hash, companyExists) => {
            return User.create({
                fname,
                lname,
                username,
                password: hash,
                smsNumber,
                email,
                pushNotifId,
                role,
                token: verificationToken
            });
        })
        .spread((createdUser) => {
            let mailPromise;
            mailPromise = mailer.sendUserVerificationEmail(createdUser.email, createdUser.fname, verificationToken);
            return Promise.all([createdUser, mailPromise]);
        })
        .spread((createdUser, mailResult) => {
            return {
                message: "User Created Successfully",
                createdUserId: createdUser.id
            };
        })
        .catch(err => {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw APIError(400, 'Username Must Be Unique', { send: { username: 'NotUnique' } });
            }
            //TODO: More detailed error handling
            throw APIError(err.status || 500, err.message || "User Creation Failed", err);
        });
}

function completeSignup(token, signupData) {
    const { username, newPass, fname, lname, smsNumber, pushNotifId } = signupData;
    return User.findByToken(token)
        .then(userData => {
            if (!userData) {
                throw APIError(404, "User Not Found");
            } else if (userData.password) {
                throw APIError(403, "User Is Already Verified");
            } else {
                return password.encrypt(newPass);
            }
        })
        .then(hash => {
            return User.update({ username, password: hash, fname, lname, smsNumber, pushNotifId, token: null }, { where: { token } });
        })
        .then(result => {
            if (result) {
                return { message: "Signup Completed Successfully" };
            } else {
                throw APIError(404, "User Not Found", { reason: "User Update Failed" });
            }
        })
        .catch(err => {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw APIError(400, 'Username Must Be Unique', { send: { username: 'NotUnique' } });
            }
            //TODO: More detailed error handling
            throw APIError(err.status || 500, err.message || "Signup Failed", err);
        });
}

function getUserInfo(userId) {
    return User.findById(userId, { paranoid: false })
        .then(user => {
            return User.extractReturnableFields(user);
        })
        .catch(err => {
            //TODO: More detailed error handling
            throw APIError(404, 'User Not Found', err);
        });
}

function getAllUsers(includeInactive = false) {
    return User.findAll({ paranoid: !includeInactive })
        .then(users => {
            return User.extractReturnableFields(users);
        })
        .catch(err => {
            throw APIError(500, 'User Retrieval Failed', err);
        });
}

function updateUser(userId, data) {
    const { fname, lname, username, pass, oldPass, smsNumber, email, pushNotifId } = data;
    let encryptPassword = pass ? password.encrypt(pass) : Promise.resolve(null);
    let loginPromise = pass ? login(username, oldPass) : Promise.resolve(null);
    return Promise.all([encryptPassword, loginPromise])
        .spread((hash, loginResult) => {
            let newUserObj = {};
            if (fname) newUserObj.fname = fname;
            if (lname) newUserObj.lname = lname;
            if (username) newUserObj.username = username;
            if (loginResult && loginResult.token && hash) newUserObj.password = hash;
            if (smsNumber) newUserObj.smsNumber = smsNumber;
            if (email) newUserObj.email = email;
            if (pushNotifId) newUserObj.pushNotifId = pushNotifId;

            return Promise.all([User.update(newUserObj, { where: { id: parseInt(userId) }, paranoid: false }), loginResult && loginResult.token]);
        })
        .spread((result, newToken) => {
            if (result[0]) {
                return { message: 'User Updated Successfully', newToken };
            } else {
                return { message: 'User Not Updated. Either the User did not exist, or no changes were requested' };
            }
        })
        .catch(err => {
            //TODO: More detailed error handling
            throw APIError(err.status || 500, err.message || "User Update Failed", err);
        });
}

function updateUserPermission(userId, newRole, currentUserRole) {
    return User.findById(parseInt(userId), { paranoid: currentUserRole !== 'admin' })
        .then(user => {
            if (!user) {
                throw APIError(404, "User Not Found");
            }

            if (!isPermissionEqualOrHigher(user.role, currentUserRole)) {
                throw APIError(403, "You may only change permission levels of Users you own");
            }

            if (!isPermissionEqualOrHigher(newRole, currentUserRole)) {
                throw APIError(403, "You may not give a User more permission than you yourself have");
            }

            return Promise.all([user.update({ role: newRole })]);
        })
        .spread((updateResult, invalidationResult) => {
            if (!updateResult) {
                throw APIError(400, "User Permission Not Updated. Either the User did not exist, or no changes were requested");
            } else {
                return { message: 'User Permission Updated Successfully' }
            }
        })
        .catch(err => {
            throw APIError(err.status || 500, err.message || "User Permission Update Failed", err);
        });
}

function deleteUser(userId, force = false) {
    return Promise.all([
        User.destroy({ where: { id: parseInt(userId) }, force, limit: 1 })
    ]).spread((result, jwtResult) => {
        if (result) {
            return [{ message: "User Deleted Successfully" }, jwtResult];
        } else {
            throw APIError(404, "User Not Found");
        }
    })
    .catch(err => {
        throw APIError(err.status || 500, err.message || "User Deletion Failed", err);
    });
}

function restoreUser(userId) {
    return User.restore({ where: { id: parseInt(userId) }, limit: 1 })
        .then((result) => {
            if (!result[0].changedRows) {
                throw APIError(404, "No Deactivated User Found");
            }
            return { message: "User Restored Successfully" };
        })
        .catch(err => {
            throw APIError(err.status || 500, err.message || "User Restoration Failed", err);
        });
}

function updatePassword(userId, oldPassword, newPassword, newPasswordConfirm) {
    if (newPassword !== newPasswordConfirm) {
        return Promise.reject(APIError(400, 'New Passwords Do Not Match'));
    }
    return Promise.all([User.findById(parseInt(userId)), password.encrypt(newPassword)])
        .spread((userData, encryptedNewPassword) => {
            return Promise.all([password.compare(oldPassword, userData.password), encryptedNewPassword]);
        })
        .spread((oldPasswordMatches, encryptedNewPassword) => {
            if (!oldPasswordMatches) {
                throw APIError(400, 'Incorrect Current Password');
            }
            return User.update({ password: encryptedNewPassword }, { where: { id: userId } });
        })
        .catch(err => {
            if (err.status === 401) {
                throw APIError(400, 'Incorrect Current Password', err);
            }
            throw APIError(err.status || 500, err.message || 'Unknown Error', err);
        });
}

function getUserInfoByToken(token) {
    return User.findOne({ where: { token } })
        .then(user => {
            if (!user) {
                throw APIError(404, 'Invalid Token');
            }
            return User.extractReturnableFields(user);
        })
        .catch(err => {
            throw APIError(err.status || 500, err.message || 'User Find Failed', err);
        });
}

module.exports = {
    login,
    generateJWT,
    requestPasswordReset,
    verifyToken,
    completePasswordReset,
    createUser,
    completeSignup,
    getUserInfo,
    getAllUsers,
    updateUser,
    updateUserPermission,
    deleteUser,
    restoreUser,
    updatePassword,
    getUserInfoByToken
};