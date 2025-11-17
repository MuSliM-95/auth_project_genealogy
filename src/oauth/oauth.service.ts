import { inject, injectable } from 'inversify';
import { IOAuthService } from './interfaces/oauth.service.interface';
import { TYPES } from '../types';
import { ProviderService } from './providers/provider.service';
import { IOAuthRepository } from './interfaces/oauth.repository.interface';
import { IUserService } from '../user/interfaces/user.service.interface';
import { ISessionService } from '../common/session.service.interface';
import { Request } from 'express';
import { AuthData } from '../auth/auth.entity';
import { AuthMethod } from '../user/model/user.model';
import { HTTPError } from '../errors/http.error.class';
import { v4 as uuidv4 } from 'uuid';
import { ITokenService } from '../token/interfaces/token.service.interface';
import { RedisConfig } from '../configs/redis.config';
import { UserType } from '../auth/interfaces/auth.service.interface';
import { TFunction } from 'i18next';

@injectable()
export class OAuthService implements IOAuthService {
	constructor(
		@inject(TYPES.ProviderService) private providerService: ProviderService,
		@inject(TYPES.OAuthRepository) private oauthRepository: IOAuthRepository,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.RedisConfig) private redisConfig: RedisConfig,
	) {}
	public async extractProfileFromCode(
		session: Request['session'],
		provider: string,
		code: string,
		t : TFunction,
		lang: string
	): Promise<{ user: UserType }> {
		const providerInstance = this.providerService.findByService(provider);

		const profile = await providerInstance?.findUserByCode(code, t, lang)!;

		const account = await this.oauthRepository.findAccountById(profile?.id, profile?.provider);

		let user = account?.userId ? await this.userService.getUserById(account.userId, t) : null;

		if (user) {
			return this.sessionService.saveSession(session, user);
		}

		user = await this.userService.getUserEmail(profile.email);
		if (user) {
			const token = uuidv4();
			await this.tokenService.generateOneTimeToken(token, user.email);
			throw new HTTPError(422, `${token}`);
		}

		const newUser = new AuthData(
			profile.email,
			profile.name,
			AuthMethod[provider as keyof typeof AuthMethod],
			true,
			profile.picture,
		);

		user = await this.userService.createUser(newUser);
		if (!account) {
			await this.oauthRepository.createAccount({
				providerId: profile.id,
				type: 'oauth',
				provider: profile.provider,
				accessToken: profile.access_token,
				refreshToken: profile.refresh_token,
				expiresAt: profile.expires_at!,
				userId: user.id,
			});
		}

		return this.sessionService.saveSession(session, user);
	}

	public async getOauthEmail(token: string): Promise<string | null> {
		const key = `oauth:token:${token}`;
		const email = await this.redisConfig.config.get(key);
    
		if (!email) {
			throw new HTTPError(404, 'Email not found')
		}
		return email;
	}

}
