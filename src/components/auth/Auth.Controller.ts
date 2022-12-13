import { Router, RequestHandler } from 'express'
import { Validator, Schema } from 'jsonschema'
import { AuthErrorCode } from '#app/constants/errors.js'
import { asyncHandler, failedBody, successBody } from '#app/utils/apiHandler.js'
import { AuthError, ErrorRegistry } from '#app/utils/errors.js'
import {
    UserDatabaseTables,
    findUser,
    addUser,
} from './Auth.Model.js'
import { validationMiddleware } from '#app/middleware/Validation.Middleware.js'
import { ResponseBody } from '#app/utils/apiTypes.js'

export const route = Router()

const authValidator = new Validator()
const authSchema: Schema = {
    id: '/auth',
    type: 'object',
    properties: {
        email: {
            description: 'email of user',
            type: 'string',
            format: 'email',
        },
        password: {
            description: 'password of user',
            type: 'string',
            minLength: 5,
        },
    },
    required: ['email', 'password'],
    additionalProperties: false,
}

interface LoginBody {
    email: string;
    password: string;
}
const loginFor = (table: UserDatabaseTables): RequestHandler<any, any, LoginBody> => asyncHandler(
    async (req, res) => {
        const user = await findUser(req.body, table, ['password'], 'exclude')
        if (user) {
            res.send(successBody(user))
        } else {
            throw new AuthError({ message: 'Failed to login, cannot find such email/password pair', code: AuthErrorCode.FAILED_TO_LOGIN })
        }
    },
)
ErrorRegistry.registerError(AuthErrorCode.FAILED_TO_LOGIN, (err, req, res) => {
    res?.status(403).send(failedBody(err.message))
})

route.post('/admin/login', validationMiddleware(authValidator, authSchema), loginFor(UserDatabaseTables.AdminUser))
route.post('/worker/login', validationMiddleware(authValidator, authSchema), loginFor(UserDatabaseTables.WorkerUser))

interface RegistrationAdminBody {
    email: string;
    password: string;
}

// <void, RegistrationAdminBody, null>
route.post<void, ResponseBody<null>, RegistrationAdminBody>(
    '/admin/registration',
    validationMiddleware(authValidator, authSchema),
    asyncHandler(async (req, res) => {
        await addUser(req.body, UserDatabaseTables.AdminUser)
        res.send(successBody(null))
    }))

route.get('/user')

