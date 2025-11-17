import { inject, injectable } from 'inversify';
import { BaseController } from '../common/base.controller';
import { ITreeController } from './interface/tree.controller.interface';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { ITreeService } from './interface/tree.service.interface';
import { Request, Response, NextFunction } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ValidateMiddleware } from '../common/validate.middleware';
import { TokenDto } from './dto/token.dto';
import { TreeDto } from './dto/tree.node.dto';
import { LangGuard } from '../auth/guards/lang.guard';

@injectable()
export class TreeController extends BaseController implements ITreeController {
	constructor(
		@inject(TYPES.ILogger) private readonly loggerService: ILogger,
		@inject(TYPES.TreeService) private readonly treeService: ITreeService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/tree/create-link',
				method: 'post',
				func: this.createLink,
				middlewares: [new AuthGuard(), new ValidateMiddleware(TreeDto), new LangGuard()],
			},
			{
				path: '/tree/link/:token',
				method: 'get',
				func: this.getTree,
				middlewares: [new ValidateMiddleware(TokenDto, 'params')],
			},
		]);
	}

	public async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
		const lang = req.lang
		const treeLink = await this.treeService.createLink(req.body, req.user!, lang);
		res.status(200).json(treeLink);
	}

	public async getTree({ params, t }: Request, res: Response, next: NextFunction): Promise<void> {
		const tree = await this.treeService.getTree(params.token, t);
		res.status(200).json(tree);
	}
}
