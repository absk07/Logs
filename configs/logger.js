'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = function initLogger(logger) {
    return (req, res, next) => {
        return apiLogs(req, res, next, logger);
    };
};

function apiLogs(req, res, next, logger) {
    req.requestTime = new Date();
    req.uuid = uuidv4();
    logger.infoIn(req);

    const send = res.send;

    res.send = function (body) {
        res.send = send;
        res.send(body);

        res.responseTime = new Date();
        logger.infoOut(res);
    };

    next();
}