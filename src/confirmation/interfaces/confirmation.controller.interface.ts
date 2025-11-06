import { NextFunction, Request, Response } from "express";
import { ConfirmationDto } from "../dto/confirmation.dto";


export interface IConfirmationController {
    newVerification: (req: Request, res: Response, next: NextFunction) => Promise<void>
    newEmailVerification: (req: Request<{}, {}, ConfirmationDto>, res: Response, next: NextFunction) => Promise<void>
}