import { prepareQueryObject, queryItem } from '#app/data/database.js'
import { hashPassword } from '#app/utils/hash.js'
import { hasOwnProperty } from '#app/utils/misc.js'

export interface User {
    id: number;
    email: string;
    password: string;
    name?: string;
}

export interface AdminUser extends User {
    restaurant_id?: number;
}

export interface WorkerUser extends User {
    branch_id: number;
    role: number;
}

export enum UserDatabaseTables {
    AdminUser = 'admin_users',
    WorkerUser = 'worker_users',
}

type UserTableMap = {
    [UserDatabaseTables.AdminUser]: AdminUser;
    [UserDatabaseTables.WorkerUser]: WorkerUser;
}

export async function findUser<UT extends UserDatabaseTables, R extends Partial<UserTableMap[UT]>>(
    userQuery: Partial<UserTableMap[UT]>,
    table: UT,
    fields: Array<keyof UserTableMap[UT]> | '*' = '*',
    selectionType: 'include'|'exclude' = 'include',
): Promise<R | undefined> {
    if (hasOwnProperty(userQuery, 'password')) {
        userQuery.password = await hashPassword(userQuery.password!)
    }
    const queryObject = prepareQueryObject(userQuery, 'select')

    const select = selectionType === 'include' ? fields : '*'

    let user = await queryItem<R>(
        `SELECT ${select.toString()} FROM ${table} WHERE ${queryObject.placeholder.join(' AND ')}`,
        queryObject.values,
    )

    if (selectionType === 'exclude' && user !== undefined) {
        if (fields === '*') {
            user = {} as R
        } else {
            fields.forEach(column => delete user![column])
        }
    }

    return user
}

export async function addUser<UT extends UserDatabaseTables, U extends UserTableMap[UT]>(
    user: Omit<U, 'id'>,
    table: UT,
): Promise<U> {
    user.password = await hashPassword(user.password)

    const queryObject = prepareQueryObject(user, 'write')

    const newUser = await queryItem<U>(
        `INSERT INTO ${table}(${queryObject.keys.toString()}) VALUES (${queryObject.placeholder}) RETURNING *`,
        queryObject.values,
    )

    return newUser!
}
