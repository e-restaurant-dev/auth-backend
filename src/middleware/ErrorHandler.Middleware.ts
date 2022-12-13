import { ErrorRegistry } from '#app/utils/errors.js'
import { NextFunction, Request, Response } from 'express'

export const errorHandler = <E extends Error>(err: E, req: Request, res: Response, next: NextFunction) => {
    ErrorRegistry.handleError(err, req, res)

    next()
}
