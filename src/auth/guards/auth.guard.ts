import { IMiddleware } from '../../common/middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../../errors/http.error.class';

export class AuthGuard implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		if (!req.user) {
			return next(
				new HTTPError(
					401,
					'Пользователь не авторизован. Пожалуйста, войдите в систему, чтобы получить доступ.',
				),
			);
		}

		next();
	}
}
