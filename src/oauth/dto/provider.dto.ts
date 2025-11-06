import { IsNotEmpty, IsString } from 'class-validator';

export class ProviderDto {
	@IsString()
	@IsNotEmpty()
	provider: 'google' | 'yandex';
}
