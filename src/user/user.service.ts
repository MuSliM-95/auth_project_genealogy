import { IUserService } from './interfaces/user.service.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { IUserRepository } from './interfaces/user.repository.interface';
import { ISessionService } from '../common/session.service.interface';
import { HTTPError } from '../errors/http.error.class';
import { User } from './model/user.model';
import { AuthData } from '../auth/auth.entity';
import { UpdateUserDto } from './dto/update.user.dto';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.UserRepository) private userRepository: IUserRepository,
		@inject(TYPES.SessionService) private sessionService: ISessionService,
	) {}

	public async createUser(user: AuthData): Promise<User> {
       return this.userRepository.create(user)
	}

	public async getUserById(id: number): Promise<User> {
		const user = await this.userRepository.findUserById(id);
		

		if (!user) {
			throw new HTTPError(404, 'Пользователь не найден. Пожалуйста, проверьте введенные данные.', 'getUserById');
		}

		return user;
	}

	public async getUserByEmailWithPassword(id: number): Promise<User> {
		const user = await this.userRepository.findUserByIdWithPassword(id);
		

		if (!user) {
			throw new HTTPError(404, 'Пользователь не найден. Пожалуйста, проверьте введенные данные.', 'getUserById');
		}

		return user;
	}

	public async getUserEmail(email: string): Promise<User | null> {
		return this.userRepository.findUserByEmail(email);
	}

	

	public async userUpdateIsVerified(id: number, isVerified: boolean): Promise<number> {
		return this.userRepository.userUpdateIsVerified(id, isVerified)
	}

	public async userPasswordUpdate(id: number, passwordHash: string): Promise<number> {
		return this.userRepository.updatePassword(id, passwordHash)
	}

	public async updateProfile(id: number, data: UpdateUserDto): Promise<User> {
		return this.userRepository.updateProfile(id, data)
	}

	public async emailUpdate(email:string, userId: number): Promise<number> {
		return this.userRepository.emailUpdate(email, userId)
	}
}
