import { Request, Response, NextFunction } from 'express';
import { IMiddleware } from '../../common/middleware.interface';
import { IUserService } from '../../user/interfaces/user.service.interface';
import { ITokenService } from '../../token/interfaces/token.service.interface';
import { TokenTypes } from '../../token/model/token.model';
import { AuthMethod } from '../../user/model/user.model';
import { HTTPError } from '../../errors/http.error.class';

export class AuthMethodGuard implements IMiddleware {
	constructor(
		private readonly userService: IUserService,
		private readonly tokenService: ITokenService,
	) {}

	async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		let authMethod = req.user?.method;
		let email;
		if (!authMethod) {
			if (!req.body.email && req.params.token) {
				const token = await this.tokenService.findTokenUnique(
					req.params.token,
					TokenTypes.password_reset,
				);
				email = token?.email;
			} else if (req.body.email) {
				email = req.body.email;
			}

			const user = await this.userService.getUserEmail(email);

			if (!user) {
				throw new HTTPError(404, req.t('userNotFound'));
			}

			authMethod = user.method;
		}

		if (authMethod !== AuthMethod.credentials) {
			throw new HTTPError(403, req.t('invalidActionForEmail'));
		}

		next();
	}
}
