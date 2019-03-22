const User = require('./User');

module.exports = sync;

function sync() {
    return User.sync()
}