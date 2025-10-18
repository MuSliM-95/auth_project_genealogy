import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDotenvConfig } from './dotenv.config.interface';
import { OAuthEntity } from '../oauth/oauth.entity';
import { GoogleProvider } from '../oauth/providers/google.provider';
import { YandexProvider } from '../oauth/providers/yandex.provider';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class ProvidersConfig {
	baseUrl: string;
	services: OAuthEntity[];

	constructor(
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {
		this.baseUrl = this.dotenvConfig.get('APPLICATION_URL');
		
		this.services = [
			new GoogleProvider({
				client_id: this.dotenvConfig.get('GOOGLE_CLIENT_ID'),
				client_secret: this.dotenvConfig.get('GOOGLE_CLIENT_SECRET'),
				scopes: ['email', 'profile'],
			}),

			new YandexProvider({
				client_id: this.dotenvConfig.get('YANDEX_CLIENT_ID'),
				client_secret: this.dotenvConfig.get('YANDEX_CLIENT_SECRET'),
				scopes: ['login:email', 'login:avatar', 'login:info'],
			}),
		];
		this.logger.log('[ProvidersConfig] Загружен');
	}
}
