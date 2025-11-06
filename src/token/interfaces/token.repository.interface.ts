import { Token, TokenTypes } from '../model/token.model';

export interface ITokenRepository {
	findToken(email: string, type: TokenTypes): Promise<Token | null>;
	findTokenUnique(token: string, type: TokenTypes): Promise<Token | null>;
	deleteTokenById(id: number, type: TokenTypes): Promise<number>;
	create: (
		email: string,
		token: string,
		userId: number,
		expiresIn: Date,
		type: TokenTypes,
	) => Promise<Token>;
	deleteToken(token: string): Promise<number>;
}
