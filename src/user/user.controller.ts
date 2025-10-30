import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserService } from './interfaces/user.service.interface';
import { BaseController } from '../common/base.controller';
import { ILogger } from '../logger/logger.interface';
import { IUserController } from './interfaces/user.controller.interface';
import { ISessionService } from '../common/session.service.interface';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { UserRole } from './model/user.model';
import { ValidateMiddleware } from '../common/validate.middleware';
import { UpdateUserDto } from './dto/update.user.dto';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
		@inject(TYPES.ILogger) private loggerService: ILogger,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				method: 'get',
				path: '/users/profile',
				middlewares: [new AuthGuard()],
				func: this.getMyProfile,
			},
			{
				method: 'get',
				path: '/users/:id',
				middlewares: [new AuthGuard(), new RoleGuard([UserRole.admin])],
				func: this.getUserById,
			},

			{
				method: 'patch',
				path: '/users/profile-update',
				middlewares: [new AuthGuard(), new ValidateMiddleware(UpdateUserDto)], 
				func: this.updateProfile
			}
		]);
	}

	public async getUserById({params, t}: Request, res: Response, next: NextFunction): Promise<void> {
		const { id } = params;
		const user = await this.userService.getUserById(Number(id), t);

		res.status(200).json(user);
	}

	public async getMyProfile({ user, t }: Request, res: Response, next: NextFunction): Promise<void> {
		const userId = user?.id;

		const userData = await this.userService.getUserById(userId!, t);
		res.status(200).json(userData);
	}

	public async updateProfile({user, body, t}: Request, res: Response, next: NextFunction): Promise<void> {
		const userId = user?.id;

		const userData = await this.userService.updateProfile(userId!, body, t);
		res.status(200).json(userData);
	}

}
