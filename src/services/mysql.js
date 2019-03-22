const Sequelize = require('sequelize');
const config = require('../../config');
const logger = require('./logger');

module.exports = {
    connect,
    getConnection
};

let _connection;

function connect(force = false) {
    if (!_connection || force) {
        const db = config.get().db;
        _connection = new Sequelize(db.name, db.username, db.password, {
            host: 'localhost',
            port: 3306,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 1,
                min: 0,
                idle: 10000
            }
        });

        return _connection.authenticate()
            .then(function (err) {
                logger.info({ message: 'Database connection has been established successfully' });
                return _connection;
            })
            .catch(function (err) {
                logger.error({ message: 'Unable to connect to the database', status: 500, additionalData: err });
                throw err;
            });

    } else {
        return Promise.resolve(_connection);
    }
}

function getConnection() {
    return _connection;
}