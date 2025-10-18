import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import nodemailer, { Transporter } from 'nodemailer';
import { IDotenvConfig } from './dotenv.config.interface';
import { ILogger } from '../logger/logger.interface';
import { parseBoolean } from '../utils/parse-boolean.util';


@injectable()
export class MailConfig {
	private _transporter: Transporter;
	constructor(
		@inject(TYPES.DotenvConfig) private dotenvConfig: IDotenvConfig,
		@inject(TYPES.ILogger) private logger: ILogger,
	) {
		this._transporter = nodemailer.createTransport({
			host: this.dotenvConfig.get('MAIL_HOST'),
			port: Number(this.dotenvConfig.get('MAIL_PORT')),
			secure: !parseBoolean(this.dotenvConfig.get('IS_DEV')),
			auth: {
				user: this.dotenvConfig.get('MAIL_LOGIN'),
				pass: this.dotenvConfig.get('MAIL_PASSWORD')
			},
		});
		this.logger.log('[MailConfig] Загружен');
	}

	public get transporter(): Transporter {
		return this._transporter
	}
}
