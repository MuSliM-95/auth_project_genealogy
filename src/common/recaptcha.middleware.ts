import { IMiddleware } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { IDotenvConfig } from '../configs/dotenv.config.interface';
import { HTTPError } from '../errors/http.error.class';
import { verify } from 'hcaptcha';

export class RecaptchaMiddleware implements IMiddleware {
	constructor(private dotenvConfig: IDotenvConfig) {}

	public async execute(req: Request, res: Response, next: NextFunction) {
		const captcha = req.headers['recaptcha'];
		const ip = req.ip

		if (!captcha || typeof captcha !== 'string') {
		     throw new HTTPError(400, 'Некорректный формат токена капчи', 'RecaptchaMiddleware')
		}

		const response = await verify(this.dotenvConfig.get('SECRET_RECAPTCHA_KEY'), captcha, ip);

		if (!response.success) {
			throw new HTTPError(400, 'Проверка капчи не пройдена', 'RecaptchaMiddleware');
		}

		next();
	}
}
