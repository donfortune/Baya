const metrics = require('../Metrics/metrics');

// Middleware to measure HTTP request duration
const requestMetricsMiddleware = (req, res, next) => {
    // Start the timer as early as possible
    const endTimer = metrics.httpTotalRequest.startTimer();

    res.on('finish', () => {
        // Normalize route to avoid high-cardinality labels
        const route =
            req.route && req.route.path
                ? req.route.path
                : 'unknown';

        endTimer({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });
    });

    next();
};

module.exports = requestMetricsMiddleware;
