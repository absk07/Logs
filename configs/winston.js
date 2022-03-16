const winston = require('winston');
const { format } = require('winston');
const winstonFile = require('winston-daily-rotate-file');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const LOG_STREAM = 'F';

const timezoned = () => {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata'
    });
}

// check if directory exists
if (!fs.existsSync('logs')) {
    // create new directory
    fs.mkdirSync('logs'); 
}

const transport = {
    console: new winston.transports.Console(),
    file: new(winston.transports.DailyRotateFile)({
        filename: 'info-%DATE%.log',
        datePattern: 'DD-MM-YYYY',
        maxSize: '100m',
        format: format.combine(format.timestamp({ format: timezoned }), format.prettyPrint()),
        dirname: 'logs'
    })
};

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        winston.format.json(),
        winston.format.printf(log => {
            return `${JSON.stringify(log)}\r\n`;
        })
    ),
    transports: [
        transport.console
    ]
});

if (LOG_STREAM.toLowerCase() === 'cf') {
    logger.add(transport.file);
} else if (LOG_STREAM.toLowerCase() === 'f') {
    logger.add(transport.file);
    logger.remove(transport.console);
}

const infoIn = (req => {
    logger.log({
        level: 'info',
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        reqId: req.uuid
    });
});

const infoOut = (res => {
    const resTimeinSec = (res.responseTime.getTime() - res.req.requestTime.getTime()) / 1000;

    logger.log({
        level: 'info',
        method: res.req.method,
        path: res.req.baseUrl,
        reqId: res.req.uuid,
        responseTime: resTimeinSec
    });
});

const error = (err => {
    logger.log({ level: 'error', error: err instanceof Error ? err.stack : err });
});

const warn = ((path, f, funcIdentifier, err) => {
    logger.log({ level: 'warn', refPath: '[' + path + ']' + ' ' + Object.keys(f)[0], warning: err instanceof Error ? err.stack : err, funcIdentifier: funcIdentifier });
});

const debugIn = ((path, f, params) => {
    const funcIdentifier = uuidv4();

    logger.log({ level: 'debug', refPath: '[' + path + ']' + ' ' + Object.keys(f)[0], input: { params }, funcIdentifier: funcIdentifier });

    return funcIdentifier;
});

const debugOut = ((path, f, funcIdentifier, params) => {
    logger.log({ level: 'debug', refPath: '[' + path + ']' + ' ' + Object.keys(f)[0], output: params, funcIdentifier: funcIdentifier });
});

module.exports = {
    infoIn: infoIn,
    infoOut: infoOut,
    debugIn: debugIn,
    debugOut: debugOut,
    error: error,
    warn: warn
};