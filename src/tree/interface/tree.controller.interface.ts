import { NextFunction, Request, Response } from "express";

export interface ITreeController {
	createLink(req: Request, res: Response, next: NextFunction): Promise<void>;
	getTree(req: Request, res: Response, next: NextFunction): Promise<void>;
}
