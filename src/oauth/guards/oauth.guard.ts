import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from '../../common/middleware.interface';
import { HTTPError } from '../../errors/http.error.class';
import { ProviderService } from '../providers/provider.service';

export class ProviderGuard implements IMiddleware {
	constructor(private providerService: ProviderService) {}

	execute(req: Request, res: Response, next: NextFunction) {
		const providerInstance = this.providerService.findByService(req.params.provider);

		if (!providerInstance) {
			throw new HTTPError(
				400,
				`Провайдер ${req.params.provider}. Пожалуйста, проверьте правильность веденных данных.`,
			'ProviderGuard');
		}

		next();
	}
}
