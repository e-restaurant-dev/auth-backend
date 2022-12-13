import { CriticalErrorCode } from '#app/constants/errors.js'
import { CriticalError } from '#app/utils/errors.js'
import { createClient, RedisClientType } from 'redis'

export type CacheClient = RedisClientType

export const instance = (): CacheClient => createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:6379`,
})

export const connect = async (cacheInstance: CacheClient): Promise<CacheClient> => {
    try {
        await cacheInstance.connect()
    } catch (err) {
        throw new CriticalError({ message: 'Cannot connect to cache!', err: err as Error, code: CriticalErrorCode.CACHE_REFUSE_CONNECT })
    }
    return cacheInstance
}

export const disconnect = async (cacheInstance: CacheClient): Promise<CacheClient> => {
    await cacheInstance.quit()
    return cacheInstance
}
