const express = require('express');
const mountUsers = require('./users');
const respond = require('../../middlewares/respond');

module.exports = function mountAPI(router) {
    router.get('/', respond((req, res) => 'Up and Running!'));

    const users = express.Router();
    mountUsers(users);
    router.use('/users', users);
};