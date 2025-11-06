import { ClassConstructor, plainToClass } from 'class-transformer';
import { IMiddleware } from './middleware.interface';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';

type ValidationSource = 'body' | 'query' | 'params';

export class ValidateMiddleware implements IMiddleware {
	constructor(
		private classToValidate: ClassConstructor<object>,
		private source: ValidationSource = 'body',
	) {}

	execute(req: Request, res: Response, next: NextFunction): void {
		const data = req[this.source];
		const instance = plainToClass(this.classToValidate, data, {
			enableImplicitConversion: true,
		});
 
		validate(instance).then((errors) => {
			if (errors.length > 0) {
				res.status(422).send(errors);
			} else {
				next();
			}
		});
	}
}
