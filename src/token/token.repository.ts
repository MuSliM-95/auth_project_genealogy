import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { SequelizeService } from '../database/sequelize.service';
import { Token, TokenTypes } from './model/token.model';
import { ITokenRepository } from './interfaces/token.repository.interface';

@injectable()
export class TokenRepository implements ITokenRepository {
	constructor(@inject(TYPES.SequelizeService) private sequelizeService: SequelizeService) {}
	public async findToken(email: string, type: TokenTypes): Promise<Token | null> {
		return this.sequelizeService.modelsAll.Token.findOne({
			where: {
				email,
				type,
			},
		});
	}

	public async findTokenUnique(token: string, type: TokenTypes): Promise<Token | null> {
		return this.sequelizeService.modelsAll.Token.findOne({
			where: {
				token,
				type,
			},
		});
	}

	public async deleteToken(id: number, type: TokenTypes): Promise<number> {
		return this.sequelizeService.modelsAll.Token.destroy({
			where: {
				id,
				type
			}
		})
	}

	public async createToken(email: string, token: string, expiresIn: Date, type: TokenTypes): Promise<Token> {
		return this.sequelizeService.modelsAll.Token.create({
		   email,
		   token,
		   expiresIn,
		   type,
		})
	}
}
