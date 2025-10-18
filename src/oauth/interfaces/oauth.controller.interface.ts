import { NextFunction, Request, Response } from 'express';

export interface IOAuthController {
	connect: (req: Request<{ provider: string }>, res: Response, next: NextFunction) => Promise<void>;
	callback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
	getExistsInfo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
