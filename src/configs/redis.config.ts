import { inject, injectable } from 'inversify';
import { Redis } from 'ioredis';
import { TYPES } from '../types';
import { IDotenvConfig } from './dotenv.config.interface';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class RedisConfig {
	private readonly _config: Redis;
	constructor(
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.ILogger) private logger: ILogger
		) {
		this._config = new Redis({
			host: this.dotenvConfig.get('REDIS_HOST'),
			port: Number(this.dotenvConfig.get('REDIS_PORT')),
			password: this.dotenvConfig.get('REDIS_PASSWORD'),
		});
		this.logger.log('[RedisConfig] Redis запушен')
	}

	public get config(): Redis {
		return this._config;
	}

	public async redisClose(): Promise<void> {
		await this._config.quit();
	}
}
