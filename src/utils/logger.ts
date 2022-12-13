import { default as pino, Logger } from 'pino'
import { default as pretty } from 'pino-pretty'

export let logger: Logger

if (process.env.NODE_ENV === 'production') {
    logger = pino()
} else {
    const stream = pretty({
        colorize: true,
        ignore: 'hostname',
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    })
    logger = pino(stream)
}
