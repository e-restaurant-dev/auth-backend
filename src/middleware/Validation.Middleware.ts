import { ValidationErrorCode } from '#app/constants/errors.js'
import { failedBody } from '#app/utils/apiHandler.js'
import { ResponseBody } from '#app/utils/apiTypes.js'
import { ValidationError } from '#app/utils/errors.js'
import { Request, RequestHandler, Response } from 'express'
import { Schema, Validator } from 'jsonschema'

export const validationMiddleware = <P = void, ResBody = any, ReqBody = any>(
    validator: Validator, schema: Schema): RequestHandler<P, ResponseBody<ResBody>, ReqBody> => (req, res, next) => {
        const result = validator.validate(req.body, schema)
        if (result.valid) {
            next()
        } else {
            throw new ValidationError({
                message: 'failed to validate request!',
                errors: result.errors,
                code: ValidationErrorCode.DEFAULT_VALIDATION_ERROR,
            })
        }
    }

export type DefaultValidationResponse = Record<string, string>
export const defaultValidationErrorHandler = (
    err: ValidationError,
    req: Request<void, ResponseBody<DefaultValidationResponse>>,
    res: Response<ResponseBody<DefaultValidationResponse>>,
) => {
    const body = err.payload.errors.reduce<Record<string, string>>((body, error) => {
        const key = error.path.length === 0
            ? error.argument
            : error.path.join('.')
        body[key] = error.message
        return body
    }, {})

    res?.status(400).send(failedBody(body))
}
