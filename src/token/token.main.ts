import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ITokenRepository } from "./interfaces/token.repository.interface";
import { TYPES } from "../types";
import { TokenRepository } from "./token.repository";
import { ITokenService } from "./interfaces/token.service.interface";
import { TokenService } from "./token.service";


export const tokenBindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
   options.bind<ITokenRepository>(TYPES.TokenRepository).to(TokenRepository)
   options.bind<ITokenService>(TYPES.TokenService).to(TokenService)
})