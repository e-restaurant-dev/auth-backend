import type { Application } from 'express'
import type { Server } from 'http'
import type { CacheClient } from '#app/data/cache.js'
import type { DatabaseClient } from '#app/data/database.js'
import { CriticalErrorCode } from '#app/constants/errors.js'
import { ErrorRegistry, CriticalError } from './errors.js'

export interface StateObject {
    database?: DatabaseClient;
    cache?: CacheClient;
    salt?: Buffer;
    app?: Application;
    server?: Server;
}
export type StateKeys = keyof StateObject

class StateConstructor {
    private state: StateObject = {}

    set<K extends StateKeys>(key: K, value: NonNullable<StateObject[K]>): StateObject[K] {
        return this.state[key] = value
    }

    get<K extends StateKeys>(key: K): StateObject[K] {
        return this.state[key]
    }

    /**
     * Be very careful with this method! Use it ONLY when you are 100% sure that value is inside of the State
     * Otherwise it would throw a critical error which will turnoff the application
     */
    getOrThrow<K extends StateKeys>(
        key: K,
    ): NonNullable<StateObject[K]> {
        const val = this.state[key]
        if (val !== undefined) {
            return val!
        }

        throw new CriticalError({ message: `unable to get ${key} from state`, code: CriticalErrorCode.GET_VALUE_FROM_STATE })
    }

    delete<K extends StateKeys>(key: K): StateObject[K] {
        const val = this.state[key]
        delete this.state[key]
        return val
    }
}
ErrorRegistry.registerError(CriticalErrorCode.GET_VALUE_FROM_STATE)

export const State = new StateConstructor()
