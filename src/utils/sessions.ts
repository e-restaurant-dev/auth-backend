import { State } from './state.js'

export interface UserSession {
    userID: string;
}

const SESSION_CACHE_PREFIX = 'session:'

export const get = async (id: string): Promise<UserSession | null> => {
    const client = State.getOrThrow('cache')

    const session = await client.hGetAll(SESSION_CACHE_PREFIX + id) as unknown as UserSession | null

    return session
}

export const set = async (id: string, session: UserSession): Promise<void> => {
    const client = State.getOrThrow('cache')

    await client.sendCommand(['HMSET', SESSION_CACHE_PREFIX + id, 'userID', session.userID])
}
