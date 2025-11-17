import { Container } from 'inversify';
import { TYPES } from '../types';
import { IOAuthService } from './interfaces/oauth.service.interface';
import { AuthMethod } from '../user/model/user.model';
import { Request } from 'express';
import { ProviderService } from './providers/provider.service';
import { IUserRepository } from '../user/interfaces/user.repository.interface';
import { IUserService } from '../user/interfaces/user.service.interface';
import { IOAuthRepository } from './interfaces/oauth.repository.interface';
import { OAuthService } from './oauth.service';
import { ISessionService } from '../common/session.service.interface';
import { ITokenService } from '../token/interfaces/token.service.interface';
import { ITokenRepository } from '../token/interfaces/token.repository.interface';
import { TokenRepository } from '../token/token.repository';
import { RedisConfig } from '../configs/redis.config';
import { TFunction } from 'i18next';
import { HTTPError } from '../errors/http.error.class';


const container = new Container();
let oauthService: IOAuthService;
let tokenService: ITokenService;
let redisConfig: RedisConfig
let providerService: ProviderService;
let oauthRepository: IOAuthRepository;
let userService: IUserService;
let sessionService: ISessionService;
let userRepository: IUserRepository;

const result = {
	id: 1,
	email: 'samahkinets@gmail.com',
	name: 'Test User',
	picture: 'https://example.com/avatar.jpg',
	role: 'REGULAR',
	isVerified: true,
	isTwoFactorEnabled: false,
	method: AuthMethod.google,
};

const mockProfile = {
	id: 'google123',
	email: 'samahkinets@gmail.com',
	name: 'Test User',
	provider: AuthMethod.google,
	access_token: 'fake_token',
	refresh_token: 'fake_refresh',
	expires_at: Date.now() + 10000,
	picture: 'https://example.com/avatar.jpg',
};

const mockProviderInstance = {
	findUserByCode: jest.fn(),
};

const mockProviderService: any = {
	findByService: jest.fn(),
};

const oauthRepositoryMock: IOAuthRepository = {
	findAccountById: jest.fn(),
	createAccount: jest.fn(),
};
const userRepositoryMock: IUserRepository = {
	create: jest.fn(),
	findUserById: jest.fn(),
	findUserByEmail: jest.fn(),
	userUpdateIsVerified: jest.fn(),
	updatePassword: jest.fn(),
	updateProfile: jest.fn(),
	emailUpdate: jest.fn(),
	findUserByIdWithPassword: jest.fn(),
	delete: jest.fn(),

};

const sessionServiceMock: ISessionService = {
	saveSession: jest.fn(),
	deleteSession: jest.fn(),
};

const tokenServiceMock: ITokenService = {
	findToken: jest.fn(),
	findTokenUnique: jest.fn(),
	deleteTokenById: jest.fn(),
	createToken: jest.fn(),
	generateOneTimeToken: jest.fn(),
	deleteToken: jest.fn(),
}

const redisConfigMock = {
	config: jest.fn(),
	redisClose: jest.fn()
}

const mockUserService = {
	createUser: jest.fn(),
	getUserById: jest.fn(),
	getUser: jest.fn(),
	getUserByEmailWithPassword: jest.fn(),
	getUserEmail: jest.fn(),
	userUpdateIsVerified: jest.fn(),
	userPasswordUpdate: jest.fn(),
	updateProfile: jest.fn(),
	emailUpdate: jest.fn(),
	deleteUser: jest.fn(),
};

const mockSession = {} as Request['session'];

beforeAll(() => {
	container.bind<ITokenService>(TYPES.TokenService).toConstantValue(tokenServiceMock)
	container.bind<RedisConfig>(TYPES.RedisConfig).toConstantValue(redisConfigMock as any)
	container.bind<IOAuthService>(TYPES.OAuthService).to(OAuthService);
	container.bind<ProviderService>(TYPES.ProviderService).toConstantValue(mockProviderService);
	container.bind<IOAuthRepository>(TYPES.OAuthRepository).toConstantValue(oauthRepositoryMock);
	container.bind<IUserRepository>(TYPES.UserRepository).toConstantValue(userRepositoryMock);
	container.bind<IUserService>(TYPES.UserService).toConstantValue(mockUserService);
	container.bind<ISessionService>(TYPES.SessionService).toConstantValue(sessionServiceMock);

	tokenService = container.get<ITokenService>(TYPES.TokenService)
	// tokenRepository = container.get<ITokenRepository>(TYPES.TokenRepository)
	oauthService = container.get<IOAuthService>(TYPES.OAuthService);
	providerService = container.get<ProviderService>(TYPES.ProviderService);
	oauthRepository = container.get<IOAuthRepository>(TYPES.OAuthRepository);
	userRepository = container.get<IUserRepository>(TYPES.UserRepository);
	userService = container.get<IUserService>(TYPES.UserService);
	sessionService = container.get<ISessionService>(TYPES.SessionService);

	mockProviderInstance.findUserByCode = jest.fn().mockResolvedValue(mockProfile)
	providerService.findByService = jest.fn().mockReturnValue(mockProviderInstance)


});

describe('oauth service', () => {
	const  t = ((key: string) => key) as unknown as TFunction;;
	const lang = 'ru'

	it('extractProfileFromCode connect success', async () => {
		oauthRepository.findAccountById = jest.fn().mockResolvedValue({ userId: 1 });

		userService.getUserById = jest.fn().mockResolvedValue(result);

		sessionService.saveSession = jest.fn().mockResolvedValue({ user: result });

		const connect = await oauthService.extractProfileFromCode(mockSession, 'google', 'oauth_code', t, lang);
		
		expect(mockProviderInstance.findUserByCode).toHaveBeenCalledWith('oauth_code', t);
		expect(oauthRepository.findAccountById).toHaveBeenCalledWith(mockProfile.id, mockProfile.provider);
		expect(userService.getUserById).toHaveBeenCalledWith(1, t);
		expect(connect.user).toEqual(result);
	});


	it('extractProfileFromCode email conflict → throws 422', async () => {
		oauthRepository.findAccountById = jest.fn().mockResolvedValue(null);

		userService.getUserById = jest.fn(),
		userService.getUserEmail = jest.fn().mockResolvedValue(result);

		tokenService.generateOneTimeToken = jest.fn().mockResolvedValue('temp_token');

		await expect(
			oauthService.extractProfileFromCode(mockSession, 'google', 'oauth_code', t, lang)
		).rejects.toThrow(HTTPError);

		expect(tokenService.generateOneTimeToken).toHaveBeenCalledWith(expect.any(String), result.email);
	});

	it('extractProfileFromCode create new user success', async () => {
		oauthRepository.findAccountById = jest.fn().mockResolvedValue(null),
		oauthRepository.createAccount = jest.fn().mockResolvedValue({});

		userService.getUserById = jest.fn().mockResolvedValue(null)
		userService.getUserEmail = jest.fn().mockResolvedValue(null),
		userService.createUser = jest.fn().mockResolvedValue(result);

		sessionService.saveSession = jest.fn().mockResolvedValue({ user: result });

		const connect = await oauthService.extractProfileFromCode(mockSession, 'google', 'oauth_code', t, lang);

		expect(mockProviderInstance.findUserByCode).toHaveBeenCalledWith('oauth_code', t);
		expect(userService.createUser).toHaveBeenCalled();
		expect(oauthRepository.createAccount).toHaveBeenCalled();
		expect(connect.user).toEqual(result);
	});

});

afterAll(() => {});
