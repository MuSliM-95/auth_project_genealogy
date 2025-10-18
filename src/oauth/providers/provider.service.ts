import { inject, injectable } from 'inversify';
import { OAuthEntity } from '../oauth.entity';
import { TYPES } from '../../types';
import { ProvidersConfig } from '../../configs/providers.config';

@injectable()
export class ProviderService {
	providers: OAuthEntity[];
	constructor(@inject(TYPES.ProvidersConfig) private providerConfig: ProvidersConfig) {
		for (const provider of this.providerConfig.services) {
			provider.baseUrl = this.providerConfig.baseUrl;
		}
	}

	public findByService(service: string) {
		return this.providerConfig.services.find((s) => s.name === service) ?? null;
	}
}
