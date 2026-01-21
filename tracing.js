/* tracing.js */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');

// 1. Point to Jaeger (Docker port 4318)
const traceExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_ENDPOINT
});

// 2. Configure the Spy
const sdk = new NodeSDK({
  serviceName: 'baya-api',
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// 3. Start the Spy
sdk.start();

console.log('🕵️‍♂️ OpenTelemetry initialized. Tracing is LIVE.');

// 4. Graceful Shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

