import { User } from '../src/user/model/user.model';

declare module 'express-session' {
	export interface SessionData {
		userId: number;
		oauthError: {
			email: string
		};
	}
}

declare global {
	namespace Express {
		export interface Request {
			user: User | null;
			lang: string;
		}
	}
}
