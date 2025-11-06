import { inject, injectable } from "inversify";
import { ITokenService } from "./interfaces/token.service.interface";
import { TYPES } from "../types";
import { ITokenRepository } from "./interfaces/token.repository.interface";
import { Token, TokenTypes } from "./model/token.model";

import { RedisConfig } from "../configs/redis.config";

@injectable()
export class TokenService implements ITokenService {
	constructor(
		@inject(TYPES.TokenRepository) private tokenRepository: ITokenRepository,
		@inject(TYPES.RedisConfig) private redisConfig: RedisConfig
		) {}

	public async createToken(email: string, token: string, userId: number, expiresIn: Date, type: TokenTypes ): Promise<Token> {
		return this.tokenRepository.create(email, token, userId,  expiresIn, type)
	}
	
	public async findTokenUnique(token: string, type: TokenTypes): Promise<Token | null> {
		return this.tokenRepository.findTokenUnique(token, type)
	}

	public async findToken(token: string, type: TokenTypes): Promise<Token | null> {
		return this.tokenRepository.findToken(token, type)
	}

	public async deleteTokenById(id: number, type: TokenTypes): Promise<number> {
		return this.tokenRepository.deleteTokenById(id, type)
	}

	public async deleteToken(token: string): Promise<number> {
       return this.tokenRepository.deleteToken(token)
	}

	public async generateOneTimeToken(token:string, email: string): Promise<void> {
		await this.redisConfig.config.setex(`oauth:token:${token}`, 300, email)
	}
}