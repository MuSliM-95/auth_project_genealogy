import { IsEmail, IsNotEmpty } from "class-validator";


export class ResetPasswordDto {
	@IsEmail({}, {message: 'Ведите корректный адрес электронной почты.'})
	@IsNotEmpty({message: 'Поля email не может быть пустым.'})
	email: string
}