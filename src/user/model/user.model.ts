import { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Column, CreatedAt, DataType, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { Account } from '../../oauth/model/account.model';

export enum UserRole {
	regular = 'REGULAR',
	admin = 'ADMIN',
}

export enum AuthMethod {
	credentials = 'CREDENTIALS',
	google = 'GOOGLE',
	yandex = 'YANDEX',
}

@Table({ tableName: 'users' })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	@Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
	declare id: CreationOptional<number>;

	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	declare email: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare name: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare password?: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare picture?: string | null;

	@Column({ type: DataType.ENUM(...Object.values(UserRole)), defaultValue: UserRole.regular, allowNull: false })
	declare role?: UserRole;

	@Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
	declare isVerified: boolean;

	@Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
	declare isTwoFactorEnabled?: boolean;

	@Column({ type: DataType.ENUM(...Object.values(AuthMethod)), allowNull: false })
	declare method: AuthMethod;

	@CreatedAt
	@Column({ type: DataType.DATE, field: 'created_at' })
	declare createdAt: CreationOptional<Date>;

	@UpdatedAt
	@Column({ type: DataType.DATE, field: 'updated_at' })
	declare updatedAt: CreationOptional<Date>;

	@HasMany(() => Account, { as: 'accounts' })
	declare accounts?: NonAttribute<Account[]>;
}
