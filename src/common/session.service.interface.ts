import { Request } from 'express';
import { UserType } from '../auth/interfaces/auth.service.interface';



export interface ISessionService {
	saveSession: (session: Request['session'], user: UserType) => Promise<{ user: UserType }>;
	deleteSession: (session: Request['session']) => Promise<void>;
}
