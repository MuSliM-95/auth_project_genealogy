import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { User } from '../../user/model/user.model';

export enum TokenTypes {
	verification = 'VERIFICATION',
	profile_delete = 'PROFILE_DELETE',
	two_factor = 'TWO_FACTOR',
	password_reset = 'PASSWORD_RESET',
	tree_link = 'TREE_LINK'
}

@Table({ tableName: 'tokens' })
export class Token extends Model<InferAttributes<Token>, InferCreationAttributes<Token>> {
	@Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
	declare id: CreationOptional<number>;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	declare userId: number

	@Column({ type: DataType.STRING, allowNull: false })
	declare email: string;

	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	declare token: string;

	@Column({ type: DataType.ENUM(...Object.values(TokenTypes)), allowNull: false })
	declare type: TokenTypes;

	@Column({ type: DataType.DATE, allowNull: false })
	declare expiresIn: Date;

	@CreatedAt
	@Column({ type: DataType.DATE, field: 'created_at' })
	declare createdAt: CreationOptional<Date>;

	@UpdatedAt
	@Column({ type: DataType.DATE, field: 'updated_at' })
	declare updatedAt: CreationOptional<Date>;
}
