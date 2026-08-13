import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from "sequelize-typescript";
import { User } from "../user/user.model";

export enum LogLevel {
	ERROR = "error",
	WARN = "warn",
	INFO = "info",
	DEBUG = "debug",
}

export enum LogCategory {
	API = "api",
	AUTH = "auth",
	DATABASE = "database",
	PAYMENT = "payment",
	NOTIFICATION = "notification",
	SYSTEM = "system",
	USER_ACTION = "user_action",
	ADMIN_ACTION = "admin_action",
	SECURITY = "security",
	PERFORMANCE = "performance",
}

@Table({
	tableName: "logs",
	modelName: "Log",
	paranoid: false,
})
export class Log extends Model {
	@Column({
		type: DataType.ENUM(...Object.values(LogLevel)),
		allowNull: false,
	})
	level: LogLevel;

	@Column({
		type: DataType.ENUM(...Object.values(LogCategory)),
		allowNull: false,
	})
	category: LogCategory;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	message: string;

	@Column({
		type: DataType.TEXT,
		allowNull: true,
	})
	details?: string;

	@Column({
		type: DataType.JSONB,
		allowNull: true,
	})
	metadata?: Record<string, any>;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	ipAddress?: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	userAgent?: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	endpoint?: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	method?: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	statusCode?: number;

	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	responseTime?: number;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	errorCode?: string;

	@Column({
		type: DataType.TEXT,
		allowNull: true,
	})
	stackTrace?: string;

	@ForeignKey(() => User)
	@Column({
		type: DataType.INTEGER,
		allowNull: true,
	})
	userId?: number;

	@BelongsTo(() => User)
	user?: User;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	sessionId?: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	requestId?: string;
}
