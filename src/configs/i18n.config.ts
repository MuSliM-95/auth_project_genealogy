import i18next, { i18n } from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import { inject, injectable } from 'inversify';
import path from 'path';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';

@injectable()
export class I18nConfig {
	private _i18next: i18n;

	constructor(@inject(TYPES.ILogger) private readonly logger: ILogger) {
		this._i18next = i18next.use(Backend).use(i18nextMiddleware.LanguageDetector);
	}

	public async init() {
		try {
			await this._i18next.init({
				fallbackLng: 'ru',
				preload: ['en', 'ru'],
				ns: ['common'], // важно, если у тебя несколько файлов
				defaultNS: 'common',
	
				backend: {
					loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
				},

				detection: {
					order: ['cookie', 'navigator', 'header', 'query'],
					lookupQuerystring: 'lang',
					lookupHeader: 'accept-language',
					lookupCookie: 'NEXT_LOCALE',
				},
			});
			this.logger.log('[I18nConfig]. i18n успешно инициализирован.')
		} catch (error) {
			this.logger.error('[I18nConfig]. Ошибка при инициализации I18n.')
		}
	}

	public get i18n() {
		return this._i18next;
	}
}
