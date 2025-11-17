import { Container, ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from './types';
import { App } from './app';
import 'reflect-metadata';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';
import { SequelizeService } from './database/sequelize.service';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { ExceptionFilter } from './errors/exception.filter';
import { IDotenvConfig } from './configs/dotenv.config.interface';
import { ISequelizeService } from './database/sequelize.service.interface';
import { ISessionService } from './common/session.service.interface';
import { SessionService } from './common/session.service';
import { RedisConfig } from './configs/redis.config';
import { SessionConfig } from './configs/session.config';
import { CorsConfig } from './configs/cors.config';
import { authBindings } from './auth/auth.main';
import { userBinding } from './user/user.main';
import { DotenvConfig } from './configs/dotenv.config';
import { oauthBindings } from './oauth/oauth.main';
import { MailConfig } from './configs/mail.config';
import { confirmationBindings } from './confirmation/confirmation.main';
import { MailService } from './common/mail/mail.service';
import { tokenBindings } from './token/token.main';
import { I18nConfig } from './configs/i18n.config';
import { treeBindings } from './tree/container';

export interface IBootstrapReturn {
	app: App;
	appContainer: Container;
}

const appBindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
	options.bind<App>(TYPES.Application).to(App);
	options.bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	options.bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	options.bind<IDotenvConfig>(TYPES.DotenvConfig).to(DotenvConfig).inSingletonScope();
	options.bind<ISessionService>(TYPES.SessionService).to(SessionService).inSingletonScope();
	options.bind<RedisConfig>(TYPES.RedisConfig).to(RedisConfig).inSingletonScope();
	options.bind<I18nConfig>(TYPES.I18nConfig).to(I18nConfig).inSingletonScope();
	options.bind<CorsConfig>(TYPES.CorsConfig).to(CorsConfig);
	options.bind<MailConfig>(TYPES.MailConfig).to(MailConfig).inSingletonScope();
	options.bind<MailService>(TYPES.MailService).to(MailService);
	options.bind<SessionConfig>(TYPES.SessionConfig).to(SessionConfig).inSingletonScope();
	options.bind<ISequelizeService>(TYPES.SequelizeService).to(SequelizeService).inSingletonScope();
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();

	appContainer.load(appBindings, authBindings, userBinding, oauthBindings, confirmationBindings, tokenBindings, treeBindings);

	const app = appContainer.get<App>(TYPES.Application);

	await app.init();

	return { app, appContainer };
}

export const boot = bootstrap();
