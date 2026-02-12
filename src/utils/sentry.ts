import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Environment helper to distinguish errors in Sentry Dashboard (Dev/Staging/Prod)
    environment: process.env.NODE_ENV || 'development',

    // Privacy: Only enable sendDefaultPii if you are sure about GDPR/Privacy compliance
    sendDefaultPii: false, 

    // Sampling Rates
    // Dev: 100% (1.0) to see everything.
    // Prod: Lower it (e.g., 0.1 for 10%) to save quota and reduce overhead.
    tracesSampleRate: isProduction ? 0.2 : 1.0, 
    
    // Profiling is heavy. Keep it low in production.
    profilesSampleRate: isProduction ? 0.1 : 1.0,

    integrations: [
        Sentry.httpIntegration(),
        Sentry.fastifyIntegration(),
        nodeProfilingIntegration()
    ],
    // debug: !isProduction, // Enable debug in dev to see if Sentry is sending data
});