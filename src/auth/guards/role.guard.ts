import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../user/model/user.model';
import { HTTPError } from '../../errors/http.error.class';
import { IMiddleware } from '../../common/middleware.interface';

export class RoleGuard implements IMiddleware {
	constructor(private readonly roles: UserRole[]) {}
	execute(req: Request, res: Response, next: NextFunction) {
		const result = this.roles.includes(req.user?.role!);

		if (!result) {
			return next(new HTTPError(403, 'Недостаточно прав. У вас не прав доступа к этом ресурсу.'));
		}

		next();
	}
}
