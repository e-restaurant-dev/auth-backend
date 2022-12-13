import { scrypt } from 'node:crypto'
import { ApiError } from './errors.js'
import { State } from './state.js'

export const hashPassword = (password: string): Promise<string> => new Promise(
    (res, rej) => {
        const normalizedPassword = password.normalize()
        const salt = State.getOrThrow('salt')

        scrypt(normalizedPassword, salt, 64, (err, result) => {
            if (err) {
                rej(new ApiError({ message: 'Failed to hash the password', code: 'FAILED_TO_HASH' }))
            } else {
                res(result.toString('hex'))
            }
        })
    },
)
