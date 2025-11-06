import { inject, injectable } from 'inversify';
import { BaseController } from '../common/base.controller';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { NextFunction, Request, Response } from 'express';
import { IOAuthService } from './interfaces/oauth.service.interface';
import { ProviderService } from './providers/provider.service';
import { HTTPError } from '../errors/http.error.class';
import { IDotenvConfig } from '../configs/dotenv.config.interface';
import { ProviderGuard } from './guards/oauth.guard';
import { ValidateMiddleware } from '../common/validate.middleware';
import { TokenDto } from './dto/token.dto';
import { CodeDto } from './dto/code.dto';
import { ProviderDto } from './dto/provider.dto';

@injectable()
export class OAuthController extends BaseController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.OAuthService) private oauthService: IOAuthService,
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.ProviderService) private providerService: ProviderService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/oauth/callback/:provider',
				method: 'get',
				func: this.callback,
				middlewares: [new ProviderGuard(providerService), new ValidateMiddleware(ProviderDto, 'params'), new ValidateMiddleware(CodeDto, 'query')],
			},
			{
				path: '/oauth/connect/:provider',
				method: 'get',
				func: this.connect,
				middlewares: [new ProviderGuard(providerService), new ValidateMiddleware(ProviderDto, 'params')],
			},
			{
				path: '/oauth/exists-info',
				method: 'get',
				func: this.getExistsInfo,
				middlewares: [new ValidateMiddleware(TokenDto, 'query')],
			},
		]);
	}

	public async connect({ params }: Request, res: Response, next: NextFunction): Promise<void> {
		const providerInstance = this.providerService.findByService(params.provider);
		res.status(200).json({ url: providerInstance?.getAuthUrl() });
	}

	public async callback(req: Request, res: Response, next: NextFunction) {
		const { session, params, query, t } = req;
		try {
			await this.oauthService.extractProfileFromCode(session, params.provider, query.code as string, t);

			res.redirect(`${this.dotenvConfig.get('CLIENT_URL_NAME')}/dashboard/settings`);
		} catch (error) {
			const err = error as any;
			if (err.statusCode === 422) {
				const token = err.message;
				res.redirect(`${this.dotenvConfig.get('CLIENT_URL_NAME')}/auth/exists?token=${token}`);
			} else {
				next(error);
			}
		}
	}

	public async getExistsInfo({ query }: Request, res: Response, next: NextFunction) {	
		const email = await this.oauthService.getOauthEmail(query.token?.toString()!);
		if (!email) {
			return res.status(404).json({ message: 'Email not found' });
		}
		res.status(200).json({ email });
	}
}
