import { inject, injectable } from 'inversify';
import { ITreeRepository } from './interface/tree.repository.interface';
import { TYPES } from '../types';
import { RedisConfig } from '../configs/redis.config';
import { TreeTypes } from './types/tree.types';

@injectable()
export class TreeRepository implements ITreeRepository {
	constructor(@inject(TYPES.RedisConfig) public readonly redisConfig: RedisConfig) {}

	public async create(tree: TreeTypes, token: string): Promise<string> {
		return this.redisConfig.config.set(token, JSON.stringify(tree), 'EX', 24 * 60 * 60 );
	}

	public async findTree(token: string): Promise<string | null> {
		return this.redisConfig.config.get(token);
	}

	public async delete(token: string): Promise<number> {
		return this.redisConfig.config.del(token);
	}
}
