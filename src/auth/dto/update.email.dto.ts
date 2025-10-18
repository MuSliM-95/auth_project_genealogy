import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class EmailUpdateDto {
	@IsString({message: 'Email должен быть строкой.'})
	@IsEmail({}, {message: 'Некорректный формат Email.'})
	@IsNotEmpty({message: 'Email обязателен для заполнения.'})
	email: string;

	@IsOptional()
	@IsString()
	code?: string
}