const auth = require('./auth');
const validate = require('../../middlewares/validate');
const validators = require('./validators');
const requirePermissionLevel = require('../../middlewares/require-permission-level');
const ensureOwnership = require('../../middlewares/ensure-ownership');
const respond = require('../../middlewares/respond');

module.exports = function mountAuth(router) {
    router.post('/',
        validate(validators.login), 
        respond((req, res) => auth.login(req.body.username, req.body.password)));
    
    router.post('/verify-jwt',
        respond((req, res) => auth.verifyJWT(req.user)));
    
    router.post('/request-password-reset',
        requirePermissionLevel.admin,
        validate(validators.requestPasswordReset),
        respond((req, res) => auth.requestPasswordReset(req.body.username)));

    router.get('/verify-token',
        requirePermissionLevel.admin,
        validate(validators.verifyToken),
        respond((req, res) => auth.verifyToken(req.query.token, req.query.type)));

    router.patch('/complete-password-reset',
        requirePermissionLevel.admin,
        validate(validators.completePasswordReset),
        respond((req, res) => auth.completePasswordReset(req.query.token, req.body.newPassword)));

    router.patch('/complete-signup',
        requirePermissionLevel.admin,
        validate(validators.completeSignup),
        respond((req, res) => auth.completeSignup(req.body.token, req.body)));

    router.patch('/update-password/self',
        requirePermissionLevel.admin,
        validate(validators.updateOwnPassword),
        respond((req, res) => auth.updatePassword(req.user.id, req.body.oldPass, req.body.newPass, req.body.newPassConfirm)));

    router.patch('/update-password/:userId',
        requirePermissionLevel.admin,
        validate(validators.updatePassword),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId); },
        respond((req, res) => auth.updatePassword(req.params.userId, req.body.oldPass, req.body.newPass, req.body.newPassConfirm)));
};