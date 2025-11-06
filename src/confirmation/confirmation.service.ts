import { v4 as uuidv4 } from 'uuid';
import { IConfirmationService } from './interfaces/confirmation.service.interface';
import { Token, TokenTypes } from '../token/model/token.model';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { Request } from 'express';
import { ConfirmationDto } from './dto/confirmation.dto';
import { HTTPError } from '../errors/http.error.class';
import { IUserService } from '../user/interfaces/user.service.interface';
import { ISessionService } from '../common/session.service.interface';
import { MailService } from '../common/mail/mail.service';
import { ITokenService } from '../token/interfaces/token.service.interface';
import { UserType } from '../auth/interfaces/auth.service.interface';
import { TFunction } from 'i18next';

@injectable()
export class ConfirmationService implements IConfirmationService {
	constructor(
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
		@inject(TYPES.MailService) private mailService: MailService,
		) {}

	public async newVerification(session: Request['session'], dto: ConfirmationDto, t: TFunction): Promise<{ user: UserType }> {
		const existingToken = await this.tokenService.findTokenUnique(dto.token, TokenTypes.verification);
	
		if(!existingToken) {
			throw new HTTPError(404, t('authTokenNotFound'))
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()
		
		if(hasExpired) {
          throw new HTTPError(400, t('confirmationTokenExpired'))
		}

		const existingUser = await this.userService.getUserById(existingToken.userId, t)

		await this.userService.userUpdateIsVerified(existingUser.id, true)

		await this.tokenService.deleteTokenById(existingToken.id, TokenTypes.verification)
        const { password, ...rest } = existingUser
		
		return this.sessionService.saveSession(session, rest)
	}

	public async verificationNewEmail(token: string, t: TFunction): Promise<boolean> {
		const existingToken = await this.tokenService.findTokenUnique(token, TokenTypes.verification)

		if(!existingToken) {
			throw new HTTPError(404, t('authTokenNotFound'))
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if(hasExpired) {
			throw new HTTPError(400, t('confirmationTokenExpired'))
		}
        
		await this.userService.emailUpdate(existingToken.email,  existingToken.userId)

		await this.tokenService.deleteTokenById(existingToken.id, TokenTypes.verification)

        return true

	}

	public async sendVerificationToken(email: string, userId: number, pathUrl: string, t: TFunction, lang: string): Promise<boolean> {
		const verificationToken = await this.generateVerificationToken(email, userId)
 		
		await this.mailService.sendConfirmationEmail(verificationToken.email, verificationToken.token, pathUrl, t, lang)

		return true
	}
	
	private async generateVerificationToken(email: string, userId: number): Promise<Token> {
		const token = uuidv4();
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000);

		const existingToken = await this.tokenService.findToken(email, TokenTypes.verification);


		if (existingToken) {
			await this.tokenService.deleteTokenById(existingToken.id, TokenTypes.verification);
		}

		const verification = await this.tokenService.createToken(
			email,
			token,
			userId,
			expiresIn,
			TokenTypes.verification,
		);

		return verification;
	}
}
