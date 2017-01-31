const Sequelize = require('sequelize');
const config = require('../../config');
const logger = require('./logger');

module.exports = {
    connect,
    connection
};

const _connection;

function connect(force = false) {
    if (!_connection || force) {
        const db = config.get().db;
        return _connection = new Sequelize(db.name, db.username, db.password, {
                host: 'localhost',
                dialect: 'mysql',
                pool: {
                    max: 1,
                    min: 0,
                    idle: 10000
                }
            }).authenticate()
            .then(function (err) {
                logger.info('Connection has been established successfully.');
                return _connection;
            })
            .catch(function (err) {
                logger.error('Unable to connect to the database:', err);
                throw err;
            });
    } else {
        return _connection;
    }
}