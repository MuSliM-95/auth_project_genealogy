import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ITreeService } from "./interface/tree.service.interface";
import { TYPES } from "../types";
import { TreeService } from "./tree.service";
import { TreeController } from "./tree.controller";
import { ITreeController } from "./interface/tree.controller.interface";
import { ITreeRepository } from "./interface/tree.repository.interface";
import { TreeRepository } from "./tree.repository";


export const treeBindings = new  ContainerModule((options: ContainerModuleLoadOptions) => {
	options.bind<ITreeController>(TYPES.TreeController).to(TreeController)
	options.bind<ITreeService>(TYPES.TreeService).to(TreeService)
	options.bind<ITreeRepository>(TYPES.TreeRepository).to(TreeRepository)
})