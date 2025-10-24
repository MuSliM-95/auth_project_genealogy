import { Request, Response, NextFunction } from 'express';
import { IMiddleware } from '../common/middleware.interface';
import { IUserService } from '../user/interfaces/user.service.interface';

export class AuthMiddleware implements IMiddleware {
	constructor(
		private userService: IUserService,
	) {}

	async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (req.session.userId) {
			req.user = await this.userService.getUserById(req.session.userId, req.t);			
			next();
		} else {
			next();
		}
	}
}
