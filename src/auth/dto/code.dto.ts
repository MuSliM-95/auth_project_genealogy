import { IsOptional, IsString } from "class-validator";


export class CodeDto {
	@IsOptional()
	@IsString()
	code?: string
}