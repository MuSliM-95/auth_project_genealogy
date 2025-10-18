import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import { ProvidersConfig } from "../configs/providers.config";
import { ProviderService } from "./providers/provider.service";
import { IOAuthRepository } from "./interfaces/oauth.repository.interface";
import { OAuthRepository } from "./oauth.repository";
import { OAuthService } from "./oauth.service";
import { IOAuthService } from "./interfaces/oauth.service.interface";
import { IOAuthController } from "./interfaces/oauth.controller.interface";
import { OAuthController } from "./oauth.controller";


export const oauthBindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
     options.bind<ProvidersConfig>(TYPES.ProvidersConfig).to(ProvidersConfig).inSingletonScope()
     options.bind<ProviderService>(TYPES.ProviderService).to(ProviderService)
     options.bind<IOAuthController>(TYPES.OAuthController).to(OAuthController)
     options.bind<IOAuthRepository>(TYPES.OAuthRepository).to(OAuthRepository)
     options.bind<IOAuthService>(TYPES.OAuthService).to(OAuthService)
})