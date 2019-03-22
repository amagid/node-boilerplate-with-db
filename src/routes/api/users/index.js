const users = require('./users');
const validate = require('../../../middlewares/validate');
const validators = require('./validators');
const requirePermissionLevel = require('../../../middlewares/require-permission-level');
const ensureOwnership = require('../../../middlewares/ensure-ownership');
const respond = require('../../../middlewares/respond');

module.exports = function mountUsers(router) {

    router.post('/create',
        requirePermissionLevel.admin,
        validate(validators.createUser),
        respond((req, res) => users.createUser(req.body, req.user)));

    router.get('/',
        requirePermissionLevel.admin,
        validate(validators.getAllUsers),
        respond((req, res) => users.getAllUsers(req.query.includeInactive)));

    router.get('/self',
        requirePermissionLevel.admin,
        validate(validators.getOwnUserInfo),
        respond((req, res) => users.getUserInfo(req.user.id)));
        
    router.get('/by-token',
        validate(validators.getUserInfoByToken),
        respond((req, res) => users.getUserInfoByToken(req.query.token)));

    router.get('/:userId',
        requirePermissionLevel.admin,
        validate(validators.getUserInfo),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId); },
        respond((req, res) => users.getUserInfo(req.params.userId)));

    router.patch('/self',
        requirePermissionLevel.admin,
        validate(validators.updateOwnUser),
        respond((req, res) => users.updateUser(req.user.id, req.body)));

    router.patch('/:userId',
        requirePermissionLevel.admin,
        validate(validators.updateUser),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId); },
        respond((req, res) => users.updateUser(req.params.userId, req.body)));

    router.patch('/:userId/permission',
        requirePermissionLevel.admin,
        validate(validators.updateUserPermission),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId); },
        respond((req, res) => users.updateUserPermission(req.params.userId, req.body.role, req.user.role)));

    router.delete('/:userId',
        requirePermissionLevel.admin,
        validate(validators.deleteUser),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId) },
        respond((req, res) => users.deleteUser(req.params.userId, false)));

    router.delete('/:userId/force',
        requirePermissionLevel.admin,
        validate(validators.deleteUser),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId) },
        respond((req, res) => users.deleteUser(req.params.userId, true)));

    router.patch('/:userId/restore',
        requirePermissionLevel.admin,
        validate(validators.restoreUser),
        (req, res, next) => { ensureOwnership(req, res, next, "user", req.params.userId) },
        respond((req, res) => users.restoreUser(req.params.userId)));

};