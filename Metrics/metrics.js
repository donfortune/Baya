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

//export the register to be used in server.js
module.exports = {
    register,
    httpTotalRequest
};