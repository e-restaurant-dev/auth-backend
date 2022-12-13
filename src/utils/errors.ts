/**
 * Error codes
 * Enlist here every possible type (code) of errors
 */

import { Request, Response } from 'express'
import { failedBody } from './apiHandler.js'
import { ResponseBody } from './apiTypes.js'
import { exit } from './exit.js'
import { logger } from './logger.js'
import { hasOwnProperty } from './misc.js'
import type { ValidationError as JSONValidationError } from 'jsonschema'

type ErrorCode = string | number;
export interface ErrorPayload {
    message: string;
    code: ErrorCode;
    err?: Error; // original error
}

export type ErrorHandler<E extends Error = Error> = (err: E, req?: Request<any, any, any>, res?: Response<ResponseBody<any>>) => void

/**
 * Error types
 */

export class ApiError extends Error {
    constructor(payload: ErrorPayload) {
        super(payload.message)
        this.payload = payload
        this.name = 'ApiError'
    }
    payload: ErrorPayload
}

export class CriticalError extends ApiError {
    constructor(payload: ErrorPayload) {
        super(payload)
        this.name = 'CriticalError'
    }
}

export class AuthError extends ApiError {
    constructor(payload: ErrorPayload) {
        super(payload)
        this.name = 'AuthError'
    }
}

export interface ValidationErrorPayload extends ErrorPayload {
    errors: Array<JSONValidationError>;
}

/**
 * For such stuff as 400 error
 */
export class ValidationError extends ApiError {
    constructor(payload: ValidationErrorPayload) {
        super(payload)
        this.payload = payload
        this.name = 'ValidationError'
    }
    override payload: ValidationErrorPayload
}

/**
 * Error Registry
 */

export const printError: ErrorHandler<Error> = (err: Error) => {
    if (err instanceof ApiError) {
        if (err instanceof CriticalError) {
            const stack = err.payload.err?.stack ?? err.stack
            logger.error({
                err: {
                    stack,
                },
            }, err.payload.message)
        } else {
            logger.error(err.payload.message)
        }
    } else {
        logger.error(err)
    }
}

/**
 * Default handler
 */
export const defaultErrorHandler = (err: any, req?: Request, res?: Response) => {
    if (err instanceof Error) {
        printError(err)
    } else {
        logger.error(err, 'Unexpected literal was thrown')
    }

    res?.status(500).send(failedBody('fail to process the request successfully'))
}


class ErrorRegistryConstructor {
    private errorHandlers: Record<ErrorCode, ErrorHandler<any>> = {}

    /**
     * Register an error handler
     * @param key Code of error
     * @param errorHandler Error handler
     * @returns handle error of ErrorRegistry
     */
    registerError<E extends ApiError>(key: ErrorCode, errorHandler: ErrorHandler<E> = defaultErrorHandler) {
        this.errorHandlers[key] = errorHandler
        return this.handleError
    }

    handleError<E extends Error>(err: E, req?: Request, res?: Response) {
        let isExit = false
        if (err instanceof ApiError) {
            if (err instanceof CriticalError) {
                isExit = true
            }

            if (hasOwnProperty(this.errorHandlers, err.payload.code)) {
                this.errorHandlers[err.payload.code]!(err, req, res)
            } else {
                logger.error(`No such error handler for code: ${err.payload.code}!`, err)
                isExit = true
            }
        } else {
            // non-ApiError instances should not be thrown. It is considered as critical error
            isExit = true
            if (err instanceof Error) {
                err.message = 'Unexpected Error was thrown! ' + err.message
            }
            defaultErrorHandler(err, req, res)
        }

        if (isExit) {
            exit()
        }
    }
}

export const ErrorRegistry = new ErrorRegistryConstructor()
