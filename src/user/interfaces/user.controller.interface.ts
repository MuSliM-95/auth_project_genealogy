import { NextFunction, Request, Response } from 'express';

export interface IUserController {
	getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
	getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
