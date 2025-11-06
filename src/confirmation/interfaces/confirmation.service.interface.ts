import { Request } from 'express';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { UserType } from '../../auth/interfaces/auth.service.interface';
import { TFunction } from 'i18next';

export interface IConfirmationService {
	newVerification: (session: Request['session'], dto: ConfirmationDto, t: TFunction) => Promise<{ user: UserType }>;
	sendVerificationToken: (email: string, userId: number, pathUrl: string, t: TFunction, lang: string) =>  Promise<boolean>;
	verificationNewEmail: (token: string, t: TFunction) => Promise<boolean>
}
