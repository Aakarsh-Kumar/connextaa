import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import logger from '../utils/logger';

type ValidationSource = 'body' | 'query' | 'params';

/**
 * Generic request validation middleware factory.
 *
 * Validates `req[source]` against the provided Zod schema.
 * On success, the parsed (and coerced) data is written back to `req[source]`.
 * On failure, returns a structured 400 response with per-field error details.
 *
 * @param schema  Zod schema to validate against
 * @param source  Part of the request to validate: 'body' | 'query' | 'params'
 *
 * @example
 *   router.post('/onboarding', validate(schemas.OnboardingRequest), controller);
 *   router.get('/collaborations', validate(paginationQuerySchema, 'query'), controller);
 */
export const validate = (schema: ZodSchema, source: ValidationSource = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.') || source,
                message: issue.message,
            }));

            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }

        // Write back parsed data so downstream gets coerced/defaulted values
        (req as unknown as Record<string, unknown>)[source] = result.data;
        next();
    };
};

/**
 * Response shape validation middleware (development only).
 *
 * Monkey-patches `res.json` to intercept the response body and run a
 * `.safeParse()` against the provided Zod schema. If the shape doesn't match
 * the spec, a warning is logged to help catch controller drift early.
 *
 * In production this middleware is a no-op — zero overhead.
 *
 * @param schema  Zod schema describing the expected response shape
 *
 * @example
 *   router.get('/auth/me', isAuthenticated, validateResponse(schemas.AuthMeResponse), controller);
 */
export const validateResponse = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (process.env.NODE_ENV === 'production') {
            next();
            return;
        }

        const originalJson = res.json.bind(res);

        res.json = function (body: unknown) {
            const result = schema.safeParse(body);
            if (!result.success) {
                logger.warn('Response schema mismatch, controller output does not match OpenAPI spec', {
                    method: req.method,
                    url: req.originalUrl,
                    issues: result.error.issues.map((issue) => ({
                        field: issue.path.join('.') || '(root)',
                        message: issue.message,
                    })),
                });
            }
            return originalJson(body);
        };

        next();
    };
};
