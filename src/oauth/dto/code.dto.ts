import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryDto {
	@IsString()
	@IsOptional()
	state: string;

	@IsString()
	@IsNotEmpty()
	code: string;

	@IsOptional()
	@IsString()
	scope?: string;

	@IsOptional()
	@IsString()
	authuser?: string;

	@IsOptional()
	@IsString()
	prompt?: string;
}
