import { Response } from 'express';
import { ZodSchema } from 'zod';
import logger from './logger';

/**
 * Typed response serializer — use this in controllers instead of `res.json()`.
 *
 * Validates and serializes controller output through a Zod schema before sending.
 * This enforces that controller output matches the OpenAPI spec and strips any
 * undeclared fields (unless the schema uses `.passthrough()`).
 *
 * **Development:** Throws on schema mismatch — surfaces bugs early, triggers
 *   the global error handler so nothing silently leaks.
 *
 * **Production:** Logs a warning and sends the raw data — avoids hard 500s
 *   for shape mismatches that don't affect the consumer.
 *
 * @param res     Express Response object
 * @param schema  Zod schema for the expected response shape
 * @param data    Data to validate and send
 * @param status  HTTP status code (default: 200)
 *
 * @example
 *   // In a controller:
 *   return sendResponse(res, schemas.AuthMeResponse, { success: true, user }, 200);
 */
export const sendResponse = <T>(
    res: Response,
    schema: ZodSchema<T>,
    data: unknown,
    status = 200,
): void => {
    if (process.env.NODE_ENV !== 'production') {
        // Strict in dev: parse throws ZodError → caught by global error handler
        const parsed = schema.parse(data);
        res.status(status).json(parsed);
    } else {
        // Lenient in prod: warn and send raw to avoid breaking the response
        const result = schema.safeParse(data);
        if (!result.success) {
            logger.warn('sendResponse: schema mismatch in production — sending raw data', {
                issues: result.error.issues,
            });
            res.status(status).json(data);
        } else {
            res.status(status).json(result.data);
        }
    }
};
