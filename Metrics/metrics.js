const client = require('prom-client');

//collect default nodejs metrics
client.collectDefaultMetrics();

//create a registry to register the metrics
const register = new client.Registry(); // create and instatntiate registry
client.collectDefaultMetrics({ register }); // register default metrics

//custom metric: http request duration histogram
const httpTotalRequest = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5] // buckets for response time from 100ms to 5s
});
register.registerMetric(httpTotalRequest);

// total users metric
const totalUsers = new client.Counter({
    name: 'total_active_users',
    help: 'Total number of active users'
});
register.registerMetric(totalUsers);

// poll votes metric
const pollVotes = new client.Gauge({
    name: 'poll_votes',
    help: 'Number of votes per poll',
    labelNames: ['pollId', 'question']
});
register.registerMetric(pollVotes);

//export the register to be used in server.js
module.exports = {
    register,
    httpTotalRequest,
    totalUsers,
    pollVotes
};