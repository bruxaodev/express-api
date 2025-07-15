import pino from 'pino';

export const config = {
    nodeEnv: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 3000,
    dbUrl:
        process.env.DB_URL || 'mongodb://localhost:27017/content-generator-api',
    jwtSecret: process.env.JWT_SECRET || '',
};

export const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
    },
});

export * from '@/config/mongo';

// sameSite?: boolean | "lax" | "strict" | "none" | undefined;
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite:
        config.nodeEnv === "production"
            ? ("none" as const)
            : (false as const),
};