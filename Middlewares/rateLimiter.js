const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
    host: process.env.REDIS_HOST ,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD, 
})

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 2, 
    standardHeaders: 'draft-8', 
    legacyHeaders: false,    
    message: 'Too many auth requests from this IP, please try again after 1 minute',
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})


const apiLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 2, 
    standardHeaders: 'draft-8', 
    legacyHeaders: false,    
    message: 'Too many requests from this IP, please try again after 1 minute',
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})

exports.authLimiter = authLimiter;
exports.apiLimiter = apiLimiter;