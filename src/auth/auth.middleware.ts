import { Request, Response, NextFunction } from 'express';
import { IMiddleware } from '../common/middleware.interface';
import { IUserService } from '../user/interfaces/user.service.interface';
import { IDotenvConfig } from '../configs/dotenv.config.interface';

export class AuthMiddleware implements IMiddleware {
	constructor(
		private userService: IUserService,
		private dotenvConfig: IDotenvConfig,
	) {}

	async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (req.session.userId) {
			const isExists = await this.userService.getUser(req.session.userId, req.t);
			if (!isExists) {
				res.clearCookie(this.dotenvConfig.get('SESSION_NAME'), {
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
					path: '/',
				});
			}
			req.user = isExists;
			next();
		} else {
			next();
		}
	}
}
