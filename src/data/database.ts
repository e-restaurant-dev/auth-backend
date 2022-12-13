import { CriticalErrorCode } from '#app/constants/errors.js'
import { CriticalError, ErrorRegistry } from '#app/utils/errors.js'
import { objectForEach } from '#app/utils/misc.js'
import { State } from '#app/utils/state.js'
import { default as PG } from 'pg'

export type DatabaseClient = PG.Client

export const instance = (options?: PG.ClientConfig): DatabaseClient => {
    const client = new PG.Client(options)
    return client
}

export const connect = async (client: DatabaseClient): Promise<DatabaseClient> => {
    try {
        await client.connect()
    } catch (err) {
        throw new CriticalError({
            message: 'Cannot connect to database!',
            err: err as Error,
            code: CriticalErrorCode.DATABASE_REFUSE_CONNECT,
        })
    }
    return client
}
ErrorRegistry.registerError(CriticalErrorCode.DATABASE_REFUSE_CONNECT)

export const disconnect = async (client: DatabaseClient): Promise<DatabaseClient> => {
    await client.end()
    return client
}


export const queryCollection = <V extends PG.QueryResultRow, I extends Array<any> = Array<any>>(
    sql: string,
    values?: I,
): Promise<Array<V>> => {
    const db = State.getOrThrow('database')

    return db.query<V>(sql, values).then(sqlEntity => sqlEntity.rows)
}
export const queryItem = <V extends PG.QueryResultRow, I extends Array<any> = Array<any>>(
    sql: string,
    values?: I,
): Promise<V | undefined> => (
        queryCollection<V, I>(sql, values).then(rows => rows[0])
    )

export interface QueryObject {
    placeholder: Array<string>;
    keys: Array<string>;
    values: Array<unknown>;
}
export const prepareQueryObject = <Q extends Record<string, any>>(obj: Q, type: 'select'|'write'): QueryObject => {
    const queryObject: QueryObject = {
        placeholder: [],
        keys: [],
        values: [],
    }

    let index = 0
    objectForEach(obj, (val, key) => {
        if (type === 'select')
            queryObject.placeholder.push(val == null ? `${key} IS NULL` : `${key} = $${++index}`)
        else
            queryObject.placeholder.push(`$${++index}`)

        queryObject.keys.push(key)
        queryObject.values.push(val)
    })

    return queryObject
}
