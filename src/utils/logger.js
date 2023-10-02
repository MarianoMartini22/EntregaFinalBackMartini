import winston from "winston";

const customLevels = {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5
};

const developmentTransport = new winston.transports.Console({ level: 'debug' });

const productionTransports = [
    new winston.transports.File({ filename: './logs.log', level: 'info' }),
    new winston.transports.File({ filename: './errors.log', level: 'error' })
];

const isDevelopment = process.env.WINSTON_ENV === 'DEV';

const transports = isDevelopment ? [developmentTransport] : productionTransports;

const logConfig = {
    levels: customLevels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level}] ${message}`;
        })
    ),
    transports: transports
};

export const logger = winston.createLogger(logConfig);
