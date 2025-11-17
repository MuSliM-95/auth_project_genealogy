import { NextFunction, Request, Response } from 'express';
import { IAuthController } from './interfaces/auth.controller.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IAuthService } from './interfaces/auth.service.interface';
import { BaseController } from '../common/base.controller';
import { ILogger } from '../logger/logger.interface';
import { RegisterDto } from './dto/users.register.dto';
import { ValidateMiddleware } from '../common/validate.middleware';
import { ISessionService } from '../common/session.service.interface';
import { IDotenvConfig } from '../configs/dotenv.config.interface';
import { LoginDto } from './dto/users.login.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { NewPasswordDto } from './dto/new.password.dto';
import { AuthGuard } from './guards/auth.guard';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { CodeDto } from './dto/code.dto';
import { ITokenService } from '../token/interfaces/token.service.interface';
import { AuthMethodGuard } from './guards/auth.method.guard';
import { IUserService } from '../user/interfaces/user.service.interface';
import { TokenDto } from './dto/token.dto';
import { LangGuard } from './guards/lang.guard';

@injectable()
export class AuthController extends BaseController implements IAuthController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.AuthService) private authService: IAuthService,
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/auth/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(RegisterDto), new LangGuard()],
			},
			{
				path: '/auth/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(LoginDto), new LangGuard()],
			},
			{
				path: '/auth/logout',
				method: 'post',
				func: this.logout,
				middlewares: [],
			},

			{
				path: '/auth/reset-password',
				method: 'post',
				func: this.resetPassword,
				middlewares: [
					new ValidateMiddleware(ResetPasswordDto),
					new AuthMethodGuard(this.userService, this.tokenService),
					new LangGuard()
				],
			},

			{
				path: '/auth/new-password/:token',
				method: 'post',
				func: this.newPassword,
				middlewares: [
					new ValidateMiddleware(NewPasswordDto),
					new ValidateMiddleware(TokenDto, 'params'),
					new AuthMethodGuard(this.userService, this.tokenService),
				],
			},
			{
				path: '/auth/update-email',
				method: 'post',
				func: this.emailUpdate,
				middlewares: [
					new AuthGuard(),
					new ValidateMiddleware(ResetPasswordDto),
					new AuthMethodGuard(this.userService, this.tokenService),
					new LangGuard()
				],
			},
			{
				path: '/auth/update-password',
				method: 'patch',
				func: this.passwordUpdate,
				middlewares: [
					new AuthGuard(),
					new ValidateMiddleware(UpdatePasswordDto),
					new AuthMethodGuard(this.userService, this.tokenService),
					new LangGuard()
				],
			},

			{
				path: '/auth/delete-profile',
				method: 'delete',
				func: this.deleteProfile,
				middlewares: [new AuthGuard(), new ValidateMiddleware(CodeDto)],
			},
		]);
	}

	public async register(
		{ body, t, lang }: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const data = await this.authService.register(body, t, lang);
		res.status(201).json(data);
	}

	public async login(
		{ body, t, session, lang }: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const data = await this.authService.login(body, session, t, lang);
		res.status(200).json(data);
	}

	public async logout({ session }: Request, res: Response, next: NextFunction): Promise<void> {
		await this.sessionService.deleteSession(session);
		res.clearCookie(this.dotenvConfig.get('SESSION_NAME'), {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
		});
		res.status(204).end();
	}

	public async resetPassword({ body, t, lang }: Request, res: Response, next: NextFunction) {
		const result = await this.authService.resetPassword(body, t, lang);
		res.status(200).json(result);
	}

	public async newPassword({ body, params, t }: Request, res: Response, next: NextFunction) {
		const result = await this.authService.newPassword(body, params.token, t);
		res.status(200).json(result);
	}

	public async emailUpdate(req: Request, res: Response, next: NextFunction) {
		const data = await this.authService.emailUpdate(
			req.body.email,
			req.user!,
			req.t,
			req.lang,
			req.body?.code,
		);
		res.status(200).json(data);
	}

	public async passwordUpdate(
		{ body, session, t, lang }: Request,
		res: Response,
		next: NextFunction,
	) {
		const data = await this.authService.passwordUpdate(
			body.oldPassword,
			body.password,
			t,
			lang,
			session.userId!,
			body?.code,
		);
		res.status(200).json(data);
	}

	public async deleteProfile(
		{ session, user, body, t }: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const data = await this.authService.deleteProfile(user!.id, t, body.code);

		if (!data.needCode) {
			await this.sessionService.deleteSession(session);
			res.clearCookie(this.dotenvConfig.get('SESSION_NAME'), {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/',
			});
		}

		res.status(200).json(data);
	}
}
