import { Token, TokenTypes } from "../model/token.model"


export interface ITokenService {
	findToken(email: string, type: TokenTypes): Promise<Token | null>
	findTokenUnique(token: string, type: TokenTypes): Promise<Token | null>
	deleteTokenById(id: number, type: TokenTypes): Promise<number>
	createToken(email: string, token: string, userId: number,  expiresIn: Date, type: TokenTypes): Promise<Token>
	generateOneTimeToken(token: string, email: string): Promise<void>
	deleteToken(token: string): Promise<number>
}