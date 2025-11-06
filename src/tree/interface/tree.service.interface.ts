import { TFunction } from 'i18next';
import { User } from '../../user/model/user.model';
import { TreeTypes } from '../types/tree.types';

export interface ITreeService {
	createLink(tree: TreeTypes, user: User, lang: string): Promise<{ link: string }>;
	getTree(token: string, t: TFunction): Promise<string>;
}
