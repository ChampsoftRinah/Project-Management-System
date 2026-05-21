import { CorsOptions } from 'cors';

const isLocalDevelopmentOrigin = (origin: string): boolean => {
  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d+$/.test(
    origin
  );
};

export const getCorsOptions = (): CorsOptions => {
  const envOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultLocalOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
  const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultLocalOrigins]));
  const allowLocalNetworkOrigins = process.env.NODE_ENV !== 'production';

  console.info('[cors] allowed origins:', allowedOrigins);
  if (allowLocalNetworkOrigins) {
    console.info('[cors] local network origin support enabled for development');
  }

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (allowLocalNetworkOrigins && isLocalDevelopmentOrigin(origin)) {
        callback(null, true);
        return;
      }

      console.warn('[cors] blocked origin:', origin);
      callback(new Error(`CORS policy: origin not allowed (${origin})`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  };
};
