import { Request } from 'express';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { UserType } from '../../auth/interfaces/auth.service.interface';

export interface IConfirmationService {
	newVerification: (session: Request['session'], dto: ConfirmationDto) => Promise<{ user: UserType }>;
	sendVerificationToken: (email: string, pathUrl: string) =>  Promise<boolean>;
	verificationNewEmail: (userId: number, token: string) => Promise<boolean>
}
