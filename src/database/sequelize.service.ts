import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IDotenvConfig } from '../configs/dotenv.config.interface';
import { ILogger } from '../logger/logger.interface';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../user/model/user.model';
import { Account } from '../oauth/model/account.model';
import { ISequelizeService, Models } from './sequelize.service.interface';
import { Token } from '../token/model/token.model';

@injectable()
export class SequelizeService implements ISequelizeService {
	sequelize: Sequelize;
	modelsAll: Models;

	constructor(
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {
		this.modelsAll = { User, Account, Token };
		this.sequelize = new Sequelize(
			this.dotenvConfig.get('POSTGRES_DB'),
			this.dotenvConfig.get('POSTGRES_USER'),
			this.dotenvConfig.get('POSTGRES_PASSWORD'),
			{
				dialect: 'postgres',
				port: Number(this.dotenvConfig.get('POSTGRES_PORT')),
				host: this.dotenvConfig.get('POSTGRES_HOST'),
				models: [User, Account, Token],
				logging: false,
			},
		);
	}

	public async connect(): Promise<void> {
		try {
			await this.sequelize.authenticate();
			await this.sequelize.sync();
			this.logger.log('[SequelizeService]. Успешно подключились к базе данных');
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error('[SequelizeService]. Ошибка при подключение к базе данных ' + error.message);
			}
		}
	}

	public async force(): Promise<void> {
		await this.sequelize.sync({ force: true });
	}

	public async disconnect(): Promise<void> {
		await this.sequelize.close();
	}
}
