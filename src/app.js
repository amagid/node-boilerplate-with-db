'use strict';
const http = require('http');
const express = require('express');
const app = express();
const config = require('../config').get();
const logger = require('./services/logger');
const db = require('./services/mysql');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const socketIO = require('socket.io');

const startup = db.connect()
    .then((connection) => {
        return require('./models/sync')();
    }).then(() => {
        return setUpAPI();
    }).then(() => {
        return startServer();
    }).catch(err => {
        console.log("ERROR ON STARTUP: ", JSON.stringify(err, null, 4));
    });

function startServer() {
    const server = http.Server(app);
    //Set up SocketIO server for realtime services
    const socketServer = socketIO(server);

    server.on('error', function(err) {
        //If the address is already in use
        if (err.code === 'EADDRINUSE') {
            logger.error(
                  '\n\n========================================\n'
                + '\n'
                + 'ERROR: Address In Use (EADDRINUSE)!\n'
                + '\n'
                + 'The server could not start because its\n'
                + `configured port (Port ${process.env.PORT || config.app.port}) is already\n`
                + 'in use by another application. This is\n'
                + 'usually caused by an attempt to start a\n'
                + 'second instance of this server while\n'
                + 'another instance is running.\n'
                + '\n'
                + 'Check to make sure there isn\'t already\n'
                + 'another instance of this application\n'
                + 'running and try again.\n'
                + '\n'
                + '=======================================\n\n'
            );
            process.exit(0);
        } else {
            logger.error(JSON.stringify(err, null, 4));
        }
    });

    server.listen(process.env.PORT || config.app.port);
    logger.info({ message: `Server listening on port ${process.env.PORT || config.app.port}` });

    return { server, socketServer };
}

function setUpAPI() {
    const decodeJWT = require('./middlewares/decode-jwt');
    const routes = require('./routes');

    //App settings
    app.set('etag', false);
    app.set('trust proxy', true);

    //General middlewares
    if (!process.env.APP_TESTING) {
        app.use(morgan('dev'));
    }
    app.use(bodyParser.json({
        type: 'application/json'
    }));
    app.use(bodyParser.raw({
        type: 'application/octet-stream'
    }));
    app.use(cors());
    app.use(decodeJWT);
    //Mount routes
    const router = express.Router();
    routes(router);
    app.use('/', router);
}

module.exports = {
    startup
};