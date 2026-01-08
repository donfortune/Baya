const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(), // Loki loves JSON
  transports: [
    // 1. Write to a file (This is what Promtail reads)
    new winston.transports.File({ filename: 'app.log' }),
    // 2. Write to the terminal (So you can still see them)
    new winston.transports.Console() 
  ],
});

module.exports = logger;