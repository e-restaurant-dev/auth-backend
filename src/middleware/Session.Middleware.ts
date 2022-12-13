import * as Session from '#app/utils/sessions.js'
import { serialize as serializeCookie } from 'cookie'
import { NextFunction, Request, Response } from 'express'
import { randomUUID as generateSID } from 'node:crypto'

const SID_COOKIE_NAME = 'SID'

export async function session(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (req.session !== undefined) {
        next()
        return
    }

    req.session = null
    const sessionId: string | undefined = req.cookies[SID_COOKIE_NAME]

    if (sessionId === undefined) {
        const sessionId = generateSID()

        const cookieAge = new Date()
        cookieAge.setFullYear(cookieAge.getFullYear() + 1)

        res.setHeader(
            'Set-Cookie',
            serializeCookie(SID_COOKIE_NAME, sessionId, {
                domain: process.env.DOMAIN,
                httpOnly: true,
                expires: cookieAge,
                path: '/',
            }),
        )
    } else {
        req.session = await Session.get(sessionId)
    }

    next()
}
