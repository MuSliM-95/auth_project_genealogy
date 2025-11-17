import { Request } from 'express';
import { UserType } from '../../auth/interfaces/auth.service.interface';
import { TFunction } from 'i18next';

export interface IOAuthService {
	extractProfileFromCode: (
		session: Request['session'],
		provider: string,
		code: string,
		t: TFunction,
		lang: string,
	) => Promise<{ user: UserType }>;
	getOauthEmail: (token: string) => Promise<string | null>;
}
