import express, { Express } from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { SequelizeService } from './database/sequelize.service';
import { ILogger } from './logger/logger.interface';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { UserController } from './user/user.controller';
import { SessionConfig } from './configs/session.config';
import { IDotenvConfig } from './configs/dotenv.config.interface';
import { CorsConfig } from './configs/cors.config';
import { AuthController } from './auth/auth.controller';
import { RedisConfig } from './configs/redis.config';
import { AuthMiddleware } from './auth/auth.middleware';
import { IUserService } from './user/interfaces/user.service.interface';
import { OAuthController } from './oauth/oauth.controller';
import { ConfirmationController } from './confirmation/confirmation.controller';
import i18nextMiddleware from 'i18next-http-middleware';
import { I18nConfig } from './configs/i18n.config';
import { TreeController } from './tree/tree.controller';


@injectable()
export class App {
	app: Express;
	port: number;
	server: Server;
	sequelize: SequelizeService;

	constructor(
		@inject(TYPES.SequelizeService) private sequelizeService: SequelizeService,
		@inject(TYPES.UserController) private userController: UserController,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.AuthController) private authController: AuthController,
		@inject(TYPES.TreeController) private treeController: TreeController,
		@inject(TYPES.OAuthController) private oauthController: OAuthController,
		@inject(TYPES.ConfirmationController) private confirmationController: ConfirmationController,
		@inject(TYPES.SessionConfig) private sessionConfig: SessionConfig,
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.CorsConfig) private corsConfig: CorsConfig,
		@inject(TYPES.RedisConfig) private redisConfig: RedisConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.I18nConfig) private I18nConfig: I18nConfig,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
	) {
		this.port = Number(this.dotenvConfig.get('APPLICATION_PORT'));
		this.app = express();
		this.exceptionFilter = exceptionFilter;
		this.sequelize = sequelizeService;
	}

	public userRoutes(): void {
		this.app.use('/api', this.authController.router);
		this.app.use('/api', this.userController.router);
		this.app.use('/api', this.oauthController.router);
		this.app.use('/api', this.confirmationController.router);
		this.app.use('/api', this.treeController.router);
	}

	public useMiddleware(): void {
		this.app.use(express.json());
		this.app.use(cookieParser(this.dotenvConfig.get('COOKIES_SECRET')));
		this.app.use(cors(this.corsConfig.config));
		this.app.use(session(this.sessionConfig));
		this.app.use(i18nextMiddleware.handle(this.I18nConfig.i18n))
		const authMiddleware = new AuthMiddleware(this.userService, this.dotenvConfig);
		this.app.use(authMiddleware.execute.bind(authMiddleware));
		this.app.use(helmet({ crossOriginResourcePolicy: false }));
	}

	public useExceptionFilter(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		await this.sequelize.connect();
		await this.I18nConfig.init()
		this.userRoutes();
		this.useExceptionFilter();
	
		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запушен на http://localhost:${this.port}`);
	}

	public async close(): Promise<void> {
		this.server.close();
		await this.redisConfig.redisClose();
	}
}
