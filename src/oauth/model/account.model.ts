import { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { User } from '../../user/model/user.model';

@Table({ tableName: 'accounts', indexes: [{unique: true, fields: ['providerId', 'provider']}] })
export class Account extends Model<InferAttributes<Account>, InferCreationAttributes<Account>> {
	@Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
	declare id: CreationOptional<number>;
	
	@Column({ type: DataType.STRING, allowNull: false })
	declare providerId: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare type: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare provider: string;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare refreshToken?: string | null;

	@Column({ type: DataType.TEXT, allowNull: true })
	declare accessToken?: string | null;

	@Column({ type: DataType.INTEGER, allowNull: false, field: 'expires_at' })
	declare expiresAt: number;

	@CreatedAt
	@Column({ type: DataType.DATE, field: 'created_at' })
	declare createdAt: CreationOptional<Date>;

	@UpdatedAt
	@Column({ type: DataType.DATE, field: 'updated_at' })
	declare updatedAt: CreationOptional<Date>;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	declare userId: number;

	@BelongsTo(() => User, { foreignKey: 'userId' })
	declare user?: NonAttribute<User>;
}
