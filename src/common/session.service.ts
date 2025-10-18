import { Request } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { ISessionService } from './session.service.interface';
import { HTTPError } from '../errors/http.error.class';
import { UserType } from '../auth/interfaces/auth.service.interface';

@injectable()
export class SessionService implements ISessionService {
	constructor(@inject(TYPES.ILogger) private logger: ILogger) {}
	public async saveSession(session: Request['session'], user: UserType): Promise<{ user: UserType }> {
		return new Promise((resolve, reject) => {
			session.userId = user.id;

			session.save((err) => {
				if (err) {
					return reject(new HTTPError(500, 'Ошибка при сохранение сессии.'));
				}
				resolve({ user });
			});
		});
	}

	public async deleteSession(session: Request['session']): Promise<void> {
		return new Promise((resolve, reject) => {
			session.destroy((err) => {
				if (err) {
					return reject(
						new HTTPError(
							500,
							'Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена.',
						),
					);
				}
				resolve();
			});
		});
	}
}
