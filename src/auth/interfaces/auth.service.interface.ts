import { Request } from 'express';
import { User } from '../../user/model/user.model';
import { RegisterDto } from '../dto/users.register.dto';
import { LoginDto } from '../dto/users.login.dto';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { NewPasswordDto } from '../dto/new.password.dto';
import { InferAttributes } from 'sequelize';
import { TFunction } from 'i18next';

export type UserAttributes = InferAttributes<User>;
export type UserType = Omit<UserAttributes, 'password'>;

export interface IAuthService {
	register: (dto: RegisterDto, t: TFunction) => Promise<{ message: string }>;

	login: (
		dto: LoginDto,
		session: Request['session'],
		t: TFunction,
	) => Promise<{ user: UserType } | { message: string }>;

	resetPassword: (dto: ResetPasswordDto, t: TFunction) => Promise<boolean>;

	newPassword: (dto: NewPasswordDto, token: string, t: TFunction) => Promise<boolean>;

	emailUpdate: (
		email: string,
		user: User,
		t: TFunction,
		code?: string,
	) => Promise<{ message: string } | { messageTwo: string }>;

	passwordUpdate: (
		oldPassword: string,
		newPassword: string,
		t: TFunction,
		userId: number,
		code?: string,
	) => Promise<{ message: string } | { messageTwo: string }>;

	deleteProfile(
		userId: number,
		t: TFunction,
		code?: string,
	): Promise<{ message: string; needCode: boolean }>;
}
