import { Request } from 'express';
import { User } from '../../user/model/user.model';
import { RegisterDto } from '../dto/users.register.dto';
import { LoginDto } from '../dto/users.login.dto';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { NewPasswordDto } from '../dto/new.password.dto';
import { InferAttributes } from 'sequelize';

export type UserAttributes = InferAttributes<User>
export type UserType = Omit<UserAttributes, 'password'>

export interface IAuthService {
	register: (dto: RegisterDto) => Promise<{ message: string }>;

	login: (dto: LoginDto, session: Request['session']) => Promise<{ user: UserType } | {message: string}>;

	resetPassword: (dto: ResetPasswordDto) => Promise<boolean>

	newPassword: (dto: NewPasswordDto, token: string) => Promise<boolean>

	emailUpdate: (email: string, user: User, code?:string) => Promise<{ message: string } | { messageTwo: string }>

	passwordUpdate: (oldPassword: string, newPassword: string, userId: number, code?: string) => Promise<{ message: string } | { messageTwo: string }>
}
