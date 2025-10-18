import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { IAuthService } from './interfaces/auth.service.interface';
import { TYPES } from '../types';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { IAuthController } from './interfaces/auth.controller.interface';


export const authBindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
	options.bind<IAuthService>(TYPES.AuthService).to(AuthService);
	options.bind<IAuthController>(TYPES.AuthController).to(AuthController);
});
