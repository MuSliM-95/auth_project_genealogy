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

@injectable()
export class AuthController extends BaseController implements IAuthController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.AuthService) private authService: IAuthService,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/auth/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(RegisterDto)],
			},
			{
				path: '/auth/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(LoginDto)],
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
				middlewares: [new ValidateMiddleware(ResetPasswordDto)],
			},

			{
				path: '/auth/new-password/:token',
				method: 'post',
				func: this.newPassword,
				middlewares: [new ValidateMiddleware(NewPasswordDto)],
			},
			{
				path: '/auth/update-email',
				method: 'post',
				func: this.emailUpdate,
				middlewares: [new AuthGuard(), new ValidateMiddleware(ResetPasswordDto)],
			},

			{
				path: '/auth/update-password',
				method: 'patch',
				func: this.passwordUpdate,
				middlewares: [new AuthGuard(), new ValidateMiddleware(UpdatePasswordDto)],
			},
		]);
	}

	public async register({ body, t }: Request, res: Response, next: NextFunction): Promise<void> {
		const data = await this.authService.register(body, t);
		res.status(201).json(data);
	}

	public async login({ body, t, session }: Request, res: Response, next: NextFunction): Promise<void> {
		const user = await this.authService.login(body, session, t);
		res.status(200).json(user);
	}

	public async logout({ session }: Request, res: Response, next: NextFunction): Promise<void> {
		await this.sessionService.deleteSession(session);
		res.clearCookie(this.dotenvConfig.get('SESSION_NAME'));
		res.status(204).end();
	}

	public async resetPassword({ body, t }: Request, res: Response, next: NextFunction) {
		const result = await this.authService.resetPassword(body, t);
		res.status(200).json(result);
	}

	public async newPassword({ body, params, t }: Request, res: Response, next: NextFunction) {
		const result = await this.authService.newPassword(body, params.token, t);
		res.status(200).json(result);
	}

	public async emailUpdate(req: Request, res: Response, next: NextFunction) {
		const data = await this.authService.emailUpdate(req.body.email, req.user!, req.t, req.body?.code);
		res.status(200).json(data);
	}

	public async passwordUpdate({ body, session, t }: Request, res: Response, next: NextFunction) {
		const data = await this.authService.passwordUpdate(body.oldPassword, body.password, t, session.userId!,  body?.code);
		res.status(200).json(data);
	}
}
