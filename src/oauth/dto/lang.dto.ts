import { IsOptional, IsString } from "class-validator";

export class LangDto {
	@IsString()
	@IsOptional()
	lang?: string
}