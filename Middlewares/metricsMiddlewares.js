// const metrics = require('../Metrics/metrics');

// // Middleware to measure HTTP request duration
// const requestMetricsMiddleware = (req, res, next) => {
//     // Start the timer as early as possible
//     const endTimer = metrics.httpTotalRequest.startTimer();

//     res.on('finish', () => {
//         // Normalize route to avoid high-cardinality labels
//         const route =
//             req.route && req.route.path
//                 ? req.route.path
//                 : 'unknown';

//         endTimer({
//             method: req.method,
//             route: route,
//             status_code: res.statusCode
//         });
//     });

//     next();
// };



// module.exports = requestMetricsMiddleware;


// Middlewares/metricsMiddlewares.js

const metrics = require('../Metrics/metrics');
const Poll = require('../Models/poll'); // Your Poll model

/**
 * Middleware to track HTTP request durations
 */
const requestMetricsMiddleware = (req, res, next) => {
    // Skip metrics endpoint itself
    if (req.path === '/metrics') return next();

    try {
        // Start timer for this request
        const endTimer = metrics.httpTotalRequest.startTimer();

        res.on('finish', () => {
            // Normalize route to avoid high-cardinality labels
            const route = req.route?.path || req.path || 'unknown';

            endTimer({
                method: req.method,
                route,
                status_code: res.statusCode
            });
        });
    } catch (err) {
        console.error('Error in requestMetricsMiddleware:', err);
    }

    next();
};


const incrementUserCounter = (req, res, next) => {
    try {
        metrics.totalUsers.inc(); // Increment counter by 1
    } catch (err) {
        console.error('Error incrementing totalUsers metric:', err);
    }
    next();
};


const updatePollVotesMiddleware = async (pollId) => {
    try {
        const poll = await Poll.findById(pollId, { question: 1, votes: 1 });
        if (poll) {
            metrics.pollVotes.set(
                { pollId: poll._id.toString(), question: poll.question },
                poll.votes ? poll.votes.length : 0
            );
        }
    } catch (err) {
        console.error('Error updating pollVotes metric:', err);
    }
};

module.exports = {
    requestMetricsMiddleware,
    incrementUserCounter,
    updatePollVotesMiddleware
};
