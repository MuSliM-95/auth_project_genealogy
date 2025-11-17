import { Request, Response, NextFunction } from "express";
import { IMiddleware } from "../../common/middleware.interface";


export class LangGuard implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		let lang = req.i18n.language.split('-')[0]
		if(req.query.state) {
			const state = JSON.parse(req.query.state as string)

            if(state?.lang) {
				lang = state.lang
			}
		}

		req.lang = lang

		next()
	}
}