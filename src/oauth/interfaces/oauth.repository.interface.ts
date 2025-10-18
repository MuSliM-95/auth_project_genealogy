import { Account } from "../model/account.model";
import { IAccount } from "../types/account.type";

export interface IOAuthRepository {
	findAccountById: (providerId: string, provider: string) => Promise<Account | null>
	createAccount: (data:  IAccount) => Promise<Account>;
}