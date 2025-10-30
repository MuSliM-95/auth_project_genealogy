import { inject, injectable } from 'inversify';
import { IUserRepository } from './interfaces/user.repository.interface';
import { TYPES } from '../types';
import { SequelizeService } from '../database/sequelize.service';
import { User } from './model/user.model';
import { AuthData } from '../auth/auth.entity';
import { UpdateUserDto } from './dto/update.user.dto';
import { HTTPError } from '../errors/http.error.class';
import { TFunction } from 'i18next';

@injectable()
export class UserRepository implements IUserRepository {
	constructor(@inject(TYPES.SequelizeService) private sequelizeService: SequelizeService) {}
	public async create({
		email,
		name,
		method,
		isVerified,
		picture,
		password,
	}: AuthData): Promise<User> {
		return this.sequelizeService.modelsAll.User.create(
			{
				email,
				password,
				name,
				picture,
				method,
				isVerified,
			},
			{
				include: [{ association: 'accounts' }],
			},
		);
	}

	public async findUserById(id: number): Promise<User | null> {
		return this.sequelizeService.modelsAll.User.findByPk(id, {
			attributes: { exclude: ['password'] },
			raw: true,
		});
	}

	public async findUserByIdWithPassword(id: number): Promise<User | null> {
		return this.sequelizeService.modelsAll.User.findByPk(id, {
			raw: true,
		});
	}

	public async findUserByEmail(email: string): Promise<User | null> {
		return this.sequelizeService.modelsAll.User.findOne({
			where: { email },
			raw: true,
		});
	}

	public async userUpdateIsVerified(id: number, isVerified: boolean): Promise<number> {
		const [affectedCount] = await this.sequelizeService.modelsAll.User.update(
			{ isVerified },
			{
				where: { id },
			},
		);

		return affectedCount;
	}

	public async updatePassword(id: number, passwordHash: string): Promise<number> {
		const [affectedCount] = await this.sequelizeService.modelsAll.User.update(
			{ password: passwordHash },
			{ where: { id } },
		);
		return affectedCount;
	}

	public async updateProfile(userId: number, data: UpdateUserDto, t: TFunction): Promise<User> {
		const user = await this.sequelizeService.modelsAll.User.findByPk(userId);

		if (!user) {
			throw new HTTPError(404, t('userNotFound'));
		}

		user.update({
			name: data.name,
			isTwoFactorEnabled: data.isTwoFactorEnabled,
		});

		return user;
	}

	public async emailUpdate(email: string, userId: number): Promise<number> {
		const [affectedCount] = await this.sequelizeService.modelsAll.User.update(
			{ email },
			{
				where: { id: userId },
			},
		);

		return affectedCount;
	}

	public async delete(userId: number): Promise<number> {
		return this.sequelizeService.modelsAll.User.destroy({
			where: {
				id: userId,
			},
		});
	}
}
