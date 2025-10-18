import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { IUserController } from './interfaces/user.controller.interface';
import { IUserService } from './interfaces/user.service.interface';
import { IUserRepository } from './interfaces/user.repository.interface';
import { TYPES } from '../types';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

export const userBinding = new ContainerModule((options: ContainerModuleLoadOptions) => {
	options.bind<IUserController>(TYPES.UserController).to(UserController);
	options.bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
	options.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
});
