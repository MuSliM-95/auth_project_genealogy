import { AuthData } from '../../auth/auth.entity';
import { EmailUpdateDto } from '../../auth/dto/update.email.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { User } from '../model/user.model';

export interface IUserRepository {
	create: (data: AuthData) => Promise<User>;
	findUserById: (id: number) => Promise<User | null>;
	findUserByEmail: (email: string) => Promise<User | null>;
	userUpdateIsVerified: (id: number, isVerified: boolean) => Promise<number>;
	updatePassword: (id: number, passwordHash: string) => Promise<number>;
	updateProfile: (id: number, data: UpdateUserDto) => Promise<User>;
	emailUpdate: (email: string, userId: number) => Promise<number>;
	findUserByIdWithPassword: (id: number) => Promise<User | null>
}
