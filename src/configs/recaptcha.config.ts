import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { RecaptchaV3 } from 'express-recaptcha/dist';
import { IDotenvConfig } from './dotenv.config.interface';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class RecaptchaConfig {
	private _config;
	constructor(
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
		) {
		this._config = new RecaptchaV3(
			this.dotenvConfig.get('SITE_RECAPTCHA_KEY'),
			this.dotenvConfig.get('SECRET_RECAPTCHA_KEY')
		);
		this.logger.log('[RecaptchaConfig] Загружен')
	}

	public get config(): RecaptchaV3 {
		return this._config
	}
}
