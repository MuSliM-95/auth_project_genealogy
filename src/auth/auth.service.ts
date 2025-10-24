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

	public async register({ name, email, password }: RegisterDto, t: TFunction): Promise<{ message: string }> {
		const isExists = await this.userService.getUserEmail(email);

		if (isExists) {
			throw new HTTPError(
				422,
				t('registrationFailedEmailExists'),
			);
		}

		const userData = new AuthData(email, name, AuthMethod.credentials, false, '');

		await userData.setPassword(password, 10);

		const user = await this.userService.createUser(userData);

		await this.confirmationService.sendVerificationToken(user.email, 'auth/new-verification', t);

		return {
			message:
				t('registrationSuccess'),
		};
	}

	public async login(
		dto: LoginDto,
		session: Request['session'],
		t: TFunction,
	): Promise<{ user: UserType } | { message: string }> {
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
			await this.confirmationService.sendVerificationToken(user.email, 'auth/new-verification', t);
			throw new HTTPError(401, t('emailNotVerified'));
		}

		if (user.isTwoFactorEnabled) {
			if (!dto.code) {
				await this.sendTwoFactorToken(user.email, t);

				return {
					message: t('twoFactorRequired'),
				};
			}

			await this.validateTwoFactorToken(user.email, dto.code, t);
		}

		const { password, ...rest } = user;

		return this.sessionService.saveSession(session, rest);
	}

	public async resetPassword(dto: ResetPasswordDto, t: TFunction): Promise<boolean> {
		const existingUser = await this.userService.getUserEmail(dto.email);

		if (!existingUser) {
			throw new HTTPError(
				404,
				t('userNotFound'),
			);
		}

		const passwordResetToken = await this.generatePasswordResetToken(dto.email);

		await this.mailService.sendPasswordResetEmail(dto.email, passwordResetToken.token, t);

		return true;
	}

	private async generatePasswordResetToken(email: string): Promise<Token> {
		const token = uuidv4();
		const expiresIn = new Date(new Date().getTime() + 3600 * 1000);

		const existingToken = await this.tokenService.findToken(email, TokenTypes.password_reset);

		if (existingToken) {
			await this.tokenService.deleteToken(existingToken.id, TokenTypes.password_reset);
		}

		const passwordResetToken = await this.tokenService.createToken(
			email,
			token,
			expiresIn,
			TokenTypes.password_reset,
		);

		return passwordResetToken;
	}

	public async newPassword({ password }: NewPasswordDto, token: string, t: TFunction): Promise<boolean> {
		const existingToken = await this.tokenService.findTokenUnique(token, TokenTypes.password_reset);

		if (!existingToken) {
			throw new HTTPError(
				404,
				t('tokenNotFound'),
			);
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date();

		if (hasExpired) {
			throw new HTTPError(
				400,
				t('tokenExpired'),
			);
		}

		const existingUser = await this.userService.getUserEmail(existingToken.email);

		if (!existingUser) {
			throw new HTTPError(
				404,
				t('userNotFound'),
			);
		}

		const passwordHash = await hash(password, 10);

		await this.userService.userPasswordUpdate(existingUser.id, passwordHash);

		await this.tokenService.deleteToken(existingToken.id, TokenTypes.password_reset);

		return true;
	}

	public async generateTwoFactorToken(email: string): Promise<Token> {
		const token = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();

		const expiresIn = new Date(new Date().getTime() + 300000);

		const existingToken = await this.tokenService.findToken(email, TokenTypes.two_factor);

		if (existingToken) {
			await this.tokenService.deleteToken(existingToken.id, TokenTypes.two_factor);
		}

		const twoFactorToken = await this.tokenService.createToken(
			email,
			token,
			expiresIn,
			TokenTypes.two_factor,
		);

		return twoFactorToken;
	}

	private async validateTwoFactorToken(email: string, code: string, t: TFunction) {
		const existingToken = await this.tokenService.findToken(email, TokenTypes.two_factor);

		if (!existingToken) {
			throw new HTTPError(
				404,
				t('twoFactorTokenNotFound'),
			);
		}

		if (existingToken.token !== code) {
			throw new HTTPError(
				400,
				t('invalidTwoFactorCode'),
			);
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date();

		if (hasExpired) {
			throw new HTTPError(
				400,
				t('twoFactorTokenExpired'),
			);
		}

		await this.tokenService.deleteToken(existingToken.id, TokenTypes.two_factor);

		return true;
	}

	public async sendTwoFactorToken(email: string, t: TFunction) {
		const twoFactorToken = await this.generateTwoFactorToken(email);
		await this.mailService.sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token, t);
		return true;
	}

	public async emailUpdate(
		email: string,
		user: User,
		t: TFunction,
		code?: string,
	): Promise<{ message: string } | { messageTwo: string }> {
		const existsEmail = await this.userService.getUserEmail(email);

		if (user.isTwoFactorEnabled) {
			if (!code) {
				await this.sendTwoFactorToken(user.email, t);
				return {
					messageTwo: t('twoFactorRequired'),
				};
			}

			await this.validateTwoFactorToken(user.email, code, t);
		}

		if (existsEmail) {
			throw new HTTPError(409, t('emailAlreadyInUse'));
		}

		if (user?.method !== AuthMethod.credentials) {
			throw new HTTPError(403, t('invalidAction'), 'emailUpdate');
		}

		await this.confirmationService.sendVerificationToken(email, 'auth/new-email', t);

		return { message: t('checkEmailForConfirmation') };
	}

	public async passwordUpdate(
		oldPassword: string,
		newPassword: string,
		t: TFunction,
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
				await this.sendTwoFactorToken(user.email, t);
				return {
					messageTwo: t('twoFactorRequired'),
				};
			}

			await this.validateTwoFactorToken(user.email, code, t);
		}

		const passwordHash = await hash(newPassword, 10);

		const updated = await this.userService.userPasswordUpdate(userId, passwordHash);

		if (!updated) {
			throw new HTTPError(500, t('passwordUpdateFailed'));
		}

		await this.mailService.sendPasswordUpdateEmail(user.email, t);

		return {
			message: t('passwordChanged'),
		};
	}
}
