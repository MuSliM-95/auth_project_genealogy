export interface IAccount {
	providerId: string,
	type: string,
	provider: string,
	accessToken?: string | null,
	refreshToken?: string | null,
	expiresAt: number,
	userId: number,
}