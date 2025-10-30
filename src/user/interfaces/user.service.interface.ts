import { TFunction } from 'i18next';
import { AuthData } from '../../auth/auth.entity';
import { UpdateUserDto } from '../dto/update.user.dto';
import { User } from '../model/user.model';

export interface IUserService {
	createUser(user: AuthData): Promise<User>;
	getUserById(id: number, t: TFunction): Promise<User>;
	getUserByEmailWithPassword: (id: number, t: TFunction) => Promise<User>;
	getUserEmail(email: string): Promise<User | null>;
	userUpdateIsVerified(id: number, isVerified: boolean): Promise<number>;
	userPasswordUpdate(id: number, passwordHash: string): Promise<number>;
	updateProfile(id: number, data: UpdateUserDto, t: TFunction): Promise<User>;
	emailUpdate(email: string, userId: number): Promise<number>;
	deleteUser(userId: number): Promise<number>;
}
