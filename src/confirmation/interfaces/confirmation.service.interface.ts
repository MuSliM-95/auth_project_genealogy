import { Request } from 'express';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { UserType } from '../../auth/interfaces/auth.service.interface';
import { TFunction } from 'i18next';

export interface IConfirmationService {
	newVerification: (session: Request['session'], dto: ConfirmationDto, t: TFunction) => Promise<{ user: UserType }>;
	sendVerificationToken: (email: string, pathUrl: string, t: TFunction) =>  Promise<boolean>;
	verificationNewEmail: (userId: number, token: string, t: TFunction) => Promise<boolean>
}
