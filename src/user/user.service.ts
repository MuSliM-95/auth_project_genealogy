import { IUserService } from './interfaces/user.service.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserRepository } from './interfaces/user.repository.interface';
import { HTTPError } from '../errors/http.error.class';
import { AuthMethod, User } from './model/user.model';
import { AuthData } from '../auth/auth.entity';
import { UpdateUserDto } from './dto/update.user.dto';
import { TFunction } from 'i18next';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.UserRepository) private userRepository: IUserRepository
	) {}

	public async createUser(user: AuthData): Promise<User> {
		return this.userRepository.create(user);
	}

	public async getUserById(id: number, t: TFunction): Promise<User> {
		const user = await this.userRepository.findUserById(id);

		if (!user) {
			throw new HTTPError(404, t('userNotFound'), 'getUserById');
		}

		return user;
	}

	public async getUser(id: number, t: TFunction): Promise<User | null> {
		return await this.userRepository.findUserById(id);
	}

	public async getUserByEmailWithPassword(id: number, t: TFunction): Promise<User> {
		const user = await this.userRepository.findUserByIdWithPassword(id);

		if (!user) {
			throw new HTTPError(404, t('userNotFound'), 'getUserById');
		}

		return user;
	}

	public async getUserEmail(email: string): Promise<User | null> {
		return this.userRepository.findUserByEmail(email);
	}

	public async userUpdateIsVerified(id: number, isVerified: boolean): Promise<number> {
		return this.userRepository.userUpdateIsVerified(id, isVerified);
	}

	public async userPasswordUpdate(id: number, passwordHash: string): Promise<number> {
		return this.userRepository.updatePassword(id, passwordHash);
	}

	public async updateProfile(user: User, data: UpdateUserDto, t: TFunction): Promise<User> {
		if(user.method !== AuthMethod.credentials && data.isTwoFactorEnabled) {
			throw new HTTPError(403, t('invalidActionForEmail'), 'updateProfile');
		}

		return this.userRepository.updateProfile(user.id, data, t);
	}

	public async emailUpdate(email: string, userId: number): Promise<number> {
		return this.userRepository.emailUpdate(email, userId);
	}

	public async deleteUser(userId: number): Promise<number> {
      return  this.userRepository.delete(userId)
	}

}
