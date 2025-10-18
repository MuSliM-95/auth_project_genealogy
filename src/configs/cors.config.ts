import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { CorsOptions } from 'cors';
import { IDotenvConfig } from './dotenv.config.interface';

@injectable()
export class CorsConfig {
	private readonly _config: CorsOptions;
	constructor(@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig) {
		this._config = {
			origin: this.dotenvConfig.get('CLIENT_URL_NAME'),
			credentials: true,
			exposedHeaders: ['set-cookie'],
		};
	}

	get config(): CorsOptions {
		return this._config;
	}
}
