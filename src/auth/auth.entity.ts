import { compare, hash } from 'bcryptjs';
import { AuthMethod } from '../user/model/user.model';

export class AuthData {
	private _password: string;
	constructor(
		public readonly email: string,
		public readonly name: string,
		public readonly method: AuthMethod,
		public readonly isVerified: boolean,
		public readonly picture: string,
		passwordHash?: string
	) {
		if(passwordHash) {
			this._password = passwordHash
		}
	}

	get password(): string {
		return this._password;
	}

	public async comparePassword(pass: string): Promise<boolean> {
		return compare(pass, this._password);
	}

	public async setPassword(pass: string, salt: number): Promise<void> {
		this._password = await hash(pass, salt);
	}
}
