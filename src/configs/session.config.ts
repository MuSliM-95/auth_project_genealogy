import { StringValue, ms } from '../utils/ms-util';
import { RedisConfig } from './redis.config';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { CookieOptions } from 'express-session';
import { RedisStore } from 'connect-redis';
import { parseBoolean } from '../utils/parse-boolean.util';
import { IDotenvConfig } from './dotenv.config.interface';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class SessionConfig {
	secret: string;
	name: string;
	resave: boolean;
	saveUninitialized: boolean;
	cookie: CookieOptions;
	store: RedisStore;

	constructor(
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.RedisConfig) private redisConfig: RedisConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {
		this.secret = this.dotenvConfig.get('SESSION_SECRET');
		this.name = this.dotenvConfig.get('SESSION_NAME');
		this.resave = true;
		this.saveUninitialized = false;
		this.cookie = {
			domain: this.dotenvConfig.get('SESSION_DOMAIN'),
			maxAge: ms(this.dotenvConfig.get('SESSION_MAX_AGE') as StringValue),
			httpOnly: parseBoolean(this.dotenvConfig.get('SESSION_HTTP_ONLY')),
			secure: parseBoolean(this.dotenvConfig.get('SESSION_SECURE')),
			sameSite: 'lax' as const,
		};
		this.store = new RedisStore({
			client: this.redisConfig.config,
			prefix: this.dotenvConfig.get('SESSION_FOLDER'),
		});
	}
}
