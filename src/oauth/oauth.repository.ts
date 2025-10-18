import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ISequelizeService } from '../database/sequelize.service.interface';
import { IOAuthRepository } from './interfaces/oauth.repository.interface';
import { Account } from './model/account.model';
import { IAccount } from './types/account.type';

@injectable()
export class OAuthRepository implements IOAuthRepository {
	constructor(@inject(TYPES.SequelizeService) private sequelizeService: ISequelizeService) {}

	public async findAccountById(providerId: string, provider: string): Promise<Account | null> {		
		return this.sequelizeService.modelsAll.Account.findOne({
			where: {
				providerId,
				provider,
			},
		});
	}

	public async createAccount(data: IAccount) {
		return this.sequelizeService.modelsAll.Account.create(data);
	}
}
