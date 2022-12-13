import { app, configureState } from './main.js'

import { logger } from './utils/logger.js'
import { beforeExit } from './utils/beforeExit.js'

import { CriticalError, ErrorRegistry } from './utils/errors.js'
import { CriticalErrorCode } from './constants/errors.js'

import { hasOwnProperty } from './utils/misc.js'
import { State } from './utils/state.js'

process.on('uncaughtException', (error: Error) => {
    ErrorRegistry.handleError(error)
})

process.on('unhandledRejection', (reason: Error) => {
    ErrorRegistry.handleError(reason)
})

process.once('SIGINT', beforeExit)
process.once('SIGTERM', beforeExit)

process.once('SIGUSR2', beforeExit) // For nodemon

if (process.env.NODE_ENV === undefined) {
    logger.warn('NODE_ENV is not specified!')
    process.env.NODE_ENV = 'development'
}

if (process.env.NODE_ENV === 'development') {
    const { config } = await import('dotenv')
    config()
}

{
    const requiredEnvProperties = [
        'ROOT_DOMAIN',
        'AUTH_CLIENT_URL',
        'PASSWORD_HASH_SALT',
        'PGDATABASE',
        'PGUSER',
        'PGPASSWORD',
        'REDIS_PASSWORD',
    ]
    const missedProperties = []

    for (const property of requiredEnvProperties) {
        if (!hasOwnProperty(process.env, property)) {
            missedProperties.push(property)
        }
    }
    if (missedProperties.length > 0) {
        throw new CriticalError({
            message: `Required properties: ${missedProperties.join(', ')} was not found in the process.env!`,
            code: CriticalErrorCode.MISSING_REQUIRED_ENV_VARIABLES,
        })
    }

    ErrorRegistry.registerError(CriticalErrorCode.MISSING_REQUIRED_ENV_VARIABLES)
}

await configureState()

const server = app.listen(3001, () => {
    logger.info('Server is started at the port 3001')
})

State.set('server', server)
