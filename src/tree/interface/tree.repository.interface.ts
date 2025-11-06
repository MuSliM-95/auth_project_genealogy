import { TreeTypes } from '../types/tree.types';

export interface ITreeRepository {
	create(tree: TreeTypes, token: string): Promise<string>;
	findTree(token: string): Promise<string | null>;
	delete(token: string): Promise<number>;
}
