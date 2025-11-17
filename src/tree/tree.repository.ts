import { inject, injectable } from 'inversify';
import { ITreeRepository } from './interface/tree.repository.interface';
import { TYPES } from '../types';
import { RedisConfig } from '../configs/redis.config';
import { TreeTypes } from './types/tree.types';

@injectable()
export class TreeRepository implements ITreeRepository {
	constructor(@inject(TYPES.RedisConfig) public readonly redisConfig: RedisConfig) {}

	public async create(tree: TreeTypes, token: string): Promise<string> {
		const key = `tree:${token}`;
		return this.redisConfig.config.set(key, JSON.stringify(tree), 'EX', 24 * 60 * 60);
	}

	public async findTree(token: string): Promise<string | null> {
		const key = `tree:${token}`;
		return this.redisConfig.config.get(key);
	}

	public async delete(token: string): Promise<number> {
		const key = `tree:${token}`;
		return this.redisConfig.config.del(key);
	}
}
