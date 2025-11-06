import { IsNotEmpty, IsString } from "class-validator";

export class TokenDto {
	@IsString({message: 'Токен должен быть строкой.'})
	@IsNotEmpty({message: 'Токен обязателен'})
	token: string
}