import { Sequelize } from 'sequelize-typescript';
import { User } from '../user/model/user.model';
import { Account } from '../oauth/model/account.model';
import { Token } from '../token/model/token.model';

export const models = { User, Account, Token };
export type Models = typeof models;

export interface ISequelizeService {
	sequelize: Sequelize;
	modelsAll: Models;

	connect: () => Promise<void>;

	disconnect: () => Promise<void>;
}
