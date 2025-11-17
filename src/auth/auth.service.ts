import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { HTTPError } from '../errors/http.error.class';
import { AuthData } from './auth.entity';
import { AuthMethod, User } from '../user/model/user.model';
import { IAuthService, UserType } from './interfaces/auth.service.interface';
import { RegisterDto } from './dto/users.register.dto';
import { Request } from 'express';
import { ISessionService } from '../common/session.service.interface';
import { LoginDto } from './dto/users.login.dto';
import { IDotenvConfig } from '../configs/dotenv.config.interface';
import { IConfirmationService } from '../confirmation/interfaces/confirmation.service.interface';
import { IUserService } from '../user/interfaces/user.service.interface';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { v4 as uuidv4 } from 'uuid';
import { ITokenService } from '../token/interfaces/token.service.interface';
import { Token, TokenTypes } from '../token/model/token.model';
import { MailService } from '../common/mail/mail.service';
import { NewPasswordDto } from './dto/new.password.dto';
import { compare, hash } from 'bcryptjs';
import { TFunction } from 'i18next';

@injectable()
export class AuthService implements IAuthService {
	constructor(
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.MailService) private mailService: MailService,
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.DotenvConfig) private dotenvService: IDotenvConfig,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
		@inject(TYPES.ConfirmationService) private confirmationService: IConfirmationService,
	) {}

	public async register(
		{ name, email, password }: RegisterDto,
		t: TFunction,
		lang: string,
	): Promise<{ message: string }> {
		const isExists = await this.userService.getUserEmail(email);

		if (isExists) {
			throw new HTTPError(422, t('registrationFailedEmailExists'));
		}

		const userData = new AuthData(email, name, AuthMethod.credentials, false, '');

		await userData.setPassword(password, 10);

		const user = await this.userService.createUser(userData);

		await this.confirmationService.sendVerificationToken(
			user.email,
			user.id,
			'auth/new-verification',
			t,
			lang,
		);

		return {
			message: t('registrationSuccess'),
		};
	}

	public async login(
		dto: LoginDto,
		session: Request['session'],
		t: TFunction,
		lang: string,
	): Promise<{ message: string } | {messageTwo: string}> {
		const user = await this.userService.getUserEmail(dto.email);

		if (!user || !user.password) {
			throw new HTTPError(404, t('userNotFound'));
		}

		const userData = new AuthData(
			user.email,
			user.name,
			user.method,
			user.isVerified,
			user.picture || '',
			user.password,
		);

		const isValidatePassword = await userData.comparePassword(dto.password);

		if (!isValidatePassword) {
			throw new HTTPError(401, t('invalidPassword'));
		}

		if (!user.isVerified) {
			await this.confirmationService.sendVerificationToken(
				user.email,
				user.id,
				'auth/new-verification',
				t,
				lang,
			);
			throw new HTTPError(401, t('emailNotVerified'));
		}

		if (user.isTwoFactorEnabled) {
			if (!dto.code) {
				await this.sendTwoFactorToken(user.email, user.id, t);

				return {
					messageTwo: t('twoFactorRequired'),
				};
			}

			await this.validateTokenCode(user.email, dto.code, TokenTypes.two_factor, t);
		}

		const { password, ...rest } = user;

		 this.sessionService.saveSession(session, rest);

		 return {
			message: t('auth-success')
		 }
	}

	public async resetPassword(dto: ResetPasswordDto, t: TFunction, lang: string): Promise<boolean> {
		const existingUser = await this.userService.getUserEmail(dto.email);

		if (!existingUser) {
			throw new HTTPError(404, t('userNotFound'));
		}

		const passwordResetToken = await this.generatePasswordResetToken(dto.email, existingUser.id);

		await this.mailService.sendPasswordResetEmail(dto.email, passwordResetToken.token, t, lang);

		return true;
	}

	private async generatePasswordResetToken(email: string, userId: number): Promise<Token> {
		const token = uuidv4();
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000);

		const existingToken = await this.tokenService.findToken(email, TokenTypes.password_reset);

		if (existingToken) {
			await this.tokenService.deleteTokenById(existingToken.id, TokenTypes.password_reset);
		}

		const passwordResetToken = await this.tokenService.createToken(
			email,
			token,
			userId,
			expiresIn,
			TokenTypes.password_reset,
		);

		return passwordResetToken;
	}

	public async newPassword(
		{ password }: NewPasswordDto,
		token: string,
		t: TFunction,
	): Promise<boolean> {
		const existingToken = await this.tokenService.findTokenUnique(token, TokenTypes.password_reset);

		if (!existingToken) {
			throw new HTTPError(404, t('tokenNotFound'));
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date();

		if (hasExpired) {
			throw new HTTPError(400, t('tokenExpired'));
		}

		const existingUser = await this.userService.getUserEmail(existingToken.email);

		if (!existingUser) {
			throw new HTTPError(404, t('userNotFound'));
		}

		const passwordHash = await hash(password, 10);

		await this.userService.userPasswordUpdate(existingUser.id, passwordHash);

		await this.tokenService.deleteTokenById(existingToken.id, TokenTypes.password_reset);

		return true;
	}

	public async generateCode(email: string, userId: number, tokenType: TokenTypes): Promise<Token> {
		const code = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();

		const expiresIn = new Date(new Date().getTime() + 300000);

		const existingToken = await this.tokenService.findToken(email, tokenType);

		if (existingToken) {
			await this.tokenService.deleteTokenById(existingToken.id, tokenType);
		}

		const newToken = await this.tokenService.createToken(email, code, userId, expiresIn, tokenType);

		return newToken;
	}

	private async validateTokenCode(
		email: string,
		code: string,
		tokenType: TokenTypes,
		t: TFunction,
	) {
		const existingToken = await this.tokenService.findToken(email, tokenType);

		if (!existingToken) {
			throw new HTTPError(404, t('twoFactorTokenNotFound'));
		}

		if (existingToken.token !== code) {
			throw new HTTPError(400, t('invalidTwoFactorCode'));
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date();

		if (hasExpired) {
			throw new HTTPError(400, t('twoFactorTokenExpired'));
		}

		await this.tokenService.deleteTokenById(existingToken.id, tokenType);

		return true;
	}

	public async sendTwoFactorToken(email: string, userId: number, t: TFunction) {
		const twoFactorToken = await this.generateCode(email, userId, TokenTypes.two_factor);
		await this.mailService.sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token, t);
		return true;
	}

	public async emailUpdate(
		email: string,
		user: User,
		t: TFunction,
		lang: string,
		code?: string,
	): Promise<{ message: string } | { messageTwo: string }> {
		const existsEmail = await this.userService.getUserEmail(email);

		if (user.isTwoFactorEnabled) {
			if (!code) {
				await this.sendTwoFactorToken(user.email, user.id, t);
				return {
					messageTwo: t('twoFactorRequired'),
				};
			}

			await this.validateTokenCode(user.email, code, TokenTypes.two_factor, t);
		}

		if (existsEmail) {
			throw new HTTPError(409, t('emailAlreadyInUse'));
		}

		await this.confirmationService.sendVerificationToken(email, user.id, 'auth/new-email', t, lang);

		return { message: t('checkEmailForConfirmation') };
	}

	public async passwordUpdate(
		oldPassword: string,
		newPassword: string,
		t: TFunction,
		lang: string,
		userId: number,
		code?: string,
	) {
		const user = await this.userService.getUserByEmailWithPassword(userId, t);

		const isMatch = await compare(oldPassword, user?.password!);

		if (!isMatch) {
			throw new HTTPError(400, t('incorrectPassword'));
		}

		if (user.isTwoFactorEnabled) {
			if (!code) {
				await this.sendTwoFactorToken(user.email, userId, t);
				return {
					messageTwo: t('twoFactorRequired'),
				};
			}

			await this.validateTokenCode(user.email, code, TokenTypes.two_factor, t);
		}

		const passwordHash = await hash(newPassword, 10);

		const updated = await this.userService.userPasswordUpdate(userId, passwordHash);

		if (!updated) {
			throw new HTTPError(500, t('passwordUpdateFailed'));
		}

		await this.mailService.sendPasswordUpdateEmail(user.email, t, lang);

		return {
			message: t('passwordChanged'),
		};
	}

	public async deleteProfile(
		userId: number,
		t: TFunction,
		code?: string,
	): Promise<{ message: string; needCode: boolean }> {
		const user = await this.userService.getUserById(userId, t);

		if (!code) {
			const tokenCode = await this.generateCode(user.email, userId, TokenTypes.profile_delete);

			await this.mailService.sendDeleteProfileCode(user.email, tokenCode.token, t);
			return {
				message: t('confirmationCodeSent'),
				needCode: true,
			};
		}

		await this.validateTokenCode(user.email, code, TokenTypes.profile_delete, t);

		await this.userService.deleteUser(userId);

		return {
			message: t('accountDeleted'),
			needCode: false,
		};
	}

}
