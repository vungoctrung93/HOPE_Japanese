const winston = require('winston');

const { combine, timestamp, printf, colorize, align } = winston.format;
const myFormat = printf(({ level, message, timestamp , at }) => {
    if(at) {
        let errorPath = at.stack.split('\n')[1].slice(7).split('/');
        const subErrorPath = errorPath[errorPath.length - 2] + '/'+ errorPath[errorPath.length-1]
        return `[${timestamp}] ${level} ${subErrorPath} : ${message}`;
    } else {
        return `[${timestamp}] ${level} : ${message}`;
    }
});
const logConfiguration = {
    format: winston.format.json(),
    'transports': [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            stderrLevels: ['error', 'alert', 'critical'],
            format: combine(
                colorize({ all: true }),
                timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                myFormat
            ),
            // label: getLabel(callingModule),
            json: false,
            timestamp: true,
            depth:true,
            colorize:true
        }),
        new winston.transports.File({
            level: 'debug',
            filename: 'BE.log',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            stderrLevels: ['error', 'alert', 'critical'],
            format: combine(
                timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                myFormat
            ),
            maxsize: 52428800, // 50MB
        })
    ],
    exitOnError: false // do not exit on handled exceptions
};

const logger = winston.createLogger(logConfiguration);

exports.logger = logger;