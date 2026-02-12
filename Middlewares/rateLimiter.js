const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 2, 
    standardHeaders: 'draft-8', 
    legacyHeaders: false,    
    message: 'Too many auth requests from this IP, please try again after 1 minute'
})


const apiLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 2, 
    standardHeaders: 'draft-8', 
    legacyHeaders: false,    
    message: 'Too many requests from this IP, please try again after 1 minute'
})

exports.authLimiter = authLimiter;
exports.apiLimiter = apiLimiter;