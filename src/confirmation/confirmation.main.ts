import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import { IConfirmationController } from "./interfaces/confirmation.controller.interface";
import { ConfirmationController } from "./confirmation.controller";
import { IConfirmationService } from "./interfaces/confirmation.service.interface";
import { ConfirmationService } from "./confirmation.service";


export const confirmationBindings = new ContainerModule((options: ContainerModuleLoadOptions) => {
	 options.bind<IConfirmationController>(TYPES.ConfirmationController).to(ConfirmationController)
	 options.bind<IConfirmationService>(TYPES.ConfirmationService).to(ConfirmationService)
})