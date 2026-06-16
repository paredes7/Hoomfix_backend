import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: 'https://4fbe40ccd8d970b194d22a6f502e1717@o4511572849459200.ingest.us.sentry.io/4511572915912704',
  release: 'hoomfix-backend@1.0.0',
  sendDefaultPii: true,
});
