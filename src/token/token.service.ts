import { inject, injectable } from "inversify";
import { ITokenService } from "./interfaces/token.service.interface";
import { TYPES } from "../types";
import { ITokenRepository } from "./interfaces/token.repository.interface";
import { TokenTypes } from "./model/token.model";

import { RedisConfig } from "../configs/redis.config";

@injectable()
export class TokenService implements ITokenService {
	constructor(
		@inject(TYPES.TokenRepository) private tokenRepository: ITokenRepository,
		@inject(TYPES.RedisConfig) private redisConfig: RedisConfig
		) {}

	public async createToken(email: string, token: string, userId: number, expiresIn: Date, type: TokenTypes ) {
		return this.tokenRepository.create(email, token, userId,  expiresIn, type)
	}
	
	public async findTokenUnique(token: string, type: TokenTypes) {
		return this.tokenRepository.findTokenUnique(token, type)
	}

	public async findToken(token: string, type: TokenTypes) {
		return this.tokenRepository.findToken(token, type)
	}

	public async deleteToken(id: number, type: TokenTypes) {
		return this.tokenRepository.deleteToken(id, type)
	}

	public async generateOneTimeToken(token:string, email: string): Promise<void> {
		await this.redisConfig.config.setex(`oauth:token:${token}`, 300, email)
	}
}