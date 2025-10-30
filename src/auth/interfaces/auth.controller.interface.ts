import { NextFunction, Request, Response } from 'express';

export interface IAuthController {
	register: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	login: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	newPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	emailUpdate: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	passwordUpdate: (req: Request, res: Response, next: NextFunction) => Promise<void>;

	deleteProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
