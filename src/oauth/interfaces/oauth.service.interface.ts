import { Request } from "express";
import { User } from "../../user/model/user.model";
import { UserType } from "../../auth/interfaces/auth.service.interface";


export interface IOAuthService {
	extractProfileFromCode: (session: Request['session'], provider: string, code: string) => Promise<{ user: UserType }>;
	getOauthEmail: (token: string) => Promise<string | null>
}
