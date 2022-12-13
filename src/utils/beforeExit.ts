import { State } from './state.js'
import { once } from './misc.js'
import { logger } from './logger.js'

export const beforeExit = once(async () => {
    const db = State.get('database')
    const cache = State.get('cache')
    const server = State.get('server')

    const jobPool: Array<Promise<any>> = []
    if (db) {
        jobPool.push(db.end())
    }
    if (cache) {
        jobPool.push(cache.quit())
    }
    if (server) {
        jobPool.push(new Promise(res => server.close(res)))
    }

    await Promise.allSettled(jobPool).then(() => {
        logger.info('Application was prepared for shutdown')
    })

    process.exit()
})
