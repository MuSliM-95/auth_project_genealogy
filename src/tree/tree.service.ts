import { inject, injectable } from 'inversify';
import { ITreeService } from './interface/tree.service.interface';
import { TreeTypes } from './types/tree.types';
import { TYPES } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ITreeRepository } from './interface/tree.repository.interface';
import { IDotenvConfig } from '../configs/dotenv.config.interface';
import { ITokenService } from '../token/interfaces/token.service.interface';
import { User } from '../user/model/user.model';
import { TokenTypes } from '../token/model/token.model';
import { HTTPError } from '../errors/http.error.class';
import { TFunction } from 'i18next';

@injectable()
export class TreeService implements ITreeService {
	constructor(
		@inject(TYPES.TreeRepository) private readonly treeRepository: ITreeRepository, 
		@inject(TYPES.TokenService) private readonly tokenService: ITokenService, 
		@inject(TYPES.DotenvConfig) private readonly dotenvConfig: IDotenvConfig, 
		) {}

	public async createLink(tree: TreeTypes, user: User, lang: string): Promise<{link: string}> {
		const token = uuidv4();
		const expiresIn = new Date(new Date().getTime() + 24 * 3600 * 1000);

		const existingToken = await this.tokenService.findToken(user.email, TokenTypes.tree_link)

		if(existingToken) {
		   await this.tokenService.deleteTokenById(existingToken.id, TokenTypes.tree_link)
		   await this.treeRepository.delete(existingToken.token)
		}
        
        const newToken = await this.tokenService.createToken(user.email, token, user.id, expiresIn, TokenTypes.tree_link)
		await this.treeRepository.create(tree, newToken.token)
		
		return {
			link: `${this.dotenvConfig.get('CLIENT_URL_NAME')}/${lang}/tree/link/${newToken.token}`
		}
	}

	public async getTree(token: string, t: TFunction): Promise<string> {
		const tree = await this.treeRepository.findTree(token)

		if(!tree) {
			await this.tokenService.deleteToken(token)
			throw new HTTPError(404, t('treeLinkExpired'))
		}

		return JSON.parse(tree)
	}
}
