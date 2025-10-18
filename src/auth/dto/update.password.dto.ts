import { IsNotEmpty, IsOptional, IsString, MinLength, Validate } from 'class-validator';
import { ValidatePasswords } from '../guards/validate.passwords.guard';
import { ValidateNewAndOldPasswords } from '../guards/validate.new.password.guard';

export class UpdatePasswordDto {
	@IsString({ message: 'Пароль должен быть строкой.' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения.' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов.' })
	oldPassword: string;

	@IsString({ message: 'Пароль должен быть строкой.' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения.' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов.' })
	@Validate(ValidateNewAndOldPasswords, {message: 'Новый пароль не должен совпадать со старым.'})
	password: string;
	
	@IsString({ message: 'Пароль подтверждения должен быть строкой.' })
	@IsNotEmpty({ message: 'Поля подтверждения пароля не может быть пустым.' })
	@MinLength(6, { message: 'Пароль подтверждения должен содержать не менее 6 символов.' })
	@Validate(ValidatePasswords, { message: 'Пароли не совпадают' })
	passwordRepeat: string;


	@IsOptional()
	@IsString()
	code?: string
}
