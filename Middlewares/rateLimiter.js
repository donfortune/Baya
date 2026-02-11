const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2, // Limit each IP to 2 requests per `window` (here, per 1 minute)
    standardHeaders: 'draft-8', // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers    
    message: 'Too many auth requests from this IP, please try again after 1 minute'
})


const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 2, // Limit each IP to 2 requests per `window` (here, per 1 minute)
    standardHeaders: 'draft-8', // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers    
    message: 'Too many requests from this IP, please try again after 1 minute'
})

exports.authLimiter = authLimiter;
exports.apiLimiter = apiLimiter;