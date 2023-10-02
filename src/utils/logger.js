import winston from "winston";

// Define los niveles personalizados y sus colores (opcional)
const customLevels = {
    debug: 'debug',
    http: 'http',
    info: 'info',
    warning: 'warn',
    error: 'error',
    fatal: 'error'
};

const developmentTransport = new winston.transports.Console({ level: 'debug' });

const productionTransports = [
    new winston.transports.File({ filename: './logs.log', level: 'info' }),
    new winston.transports.File({ filename: './errors.log', level: 'error' })
];

const isDevelopment = process.env.WINSTON_ENV === 'DEV';

const transports = isDevelopment ? [developmentTransport] : productionTransports;

// Función personalizada para formatear el mensaje
const customFormatMessage = winston.format.printf(({ timestamp, level, message }) => {
    if (typeof message === 'object') {
        return `[${timestamp}] [${level}] ${JSON.stringify(message, null, 2)}`;
    } else {
        return `[${timestamp}] [${level}] ${message}`;
    }
});

const logConfig = {
    levels: customLevels,
    format: winston.format.combine(
        winston.format.timestamp(),
        customFormatMessage,
    ),
    transports: transports
};

export const logger = winston.createLogger(logConfig);
