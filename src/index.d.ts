
import { UserSession } from './utils/sessions.js'

declare global {
    namespace Express {
        export interface Request {
            session: UserSession | null;
        }
    }
}
