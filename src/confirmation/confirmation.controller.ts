import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../common/base.controller';
import { IConfirmationController } from './interfaces/confirmation.controller.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { IConfirmationService } from './interfaces/confirmation.service.interface';
import { ConfirmationDto } from './dto/confirmation.dto';
import { ValidateMiddleware } from '../common/validate.middleware';

@injectable()
export class ConfirmationController extends BaseController implements IConfirmationController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ConfirmationService) private confirmationService: IConfirmationService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/auth/email-confirmation',
				method: 'patch',
				func: this.newVerification,
				middlewares: [new ValidateMiddleware(ConfirmationDto)],
			},
			{
				path: '/auth/new-email/confirmation',
				method: 'patch',
				func: this.newEmailVerification,
				middlewares: [new ValidateMiddleware(ConfirmationDto)],
			},
		]);
	}

	public async newVerification(
		{ session, body, t }: Request<{}, {}, ConfirmationDto>,
		res: Response,
		next: NextFunction,
	) {
		const result = await this.confirmationService.newVerification(session, body, t);
		res.status(200).json(result);
	}

	public async newEmailVerification(
		{ body, t }: Request<{}, {}, ConfirmationDto>,
		res: Response,
		next: NextFunction,
	) {
		await this.confirmationService.verificationNewEmail(
			body.token!.toString(),
			t
		);
		res.sendStatus(204);
	}
}
