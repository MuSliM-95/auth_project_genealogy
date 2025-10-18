import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';
import { UserRole } from '../src/user/model/user.model';
import { TokenTypes } from '../src/token/model/token.model';
import { QueryTypes } from 'sequelize';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

describe('confirmation e2e', () => {
	const result = {
		id: 1,
		email: 'samahkinets@gmail.com',
		name: 'Muhammad',
		picture: '',
		role: UserRole.regular,
		isVerified: false,
		isTwoFactorEnabled: false,
		method: 'CREDENTIALS',
		createdAt: expect.any(String),
		updatedAt: expect.any(String),
	};

	it('verification', async () => {
		await request(application.app).post('/api/auth/register').send({
			email: 'samahkinets@gmail.com',
			name: 'Muhammad',
			password: '123456',
			passwordRepeat: '123456',
		});

		const token = await application.sequelize.modelsAll.Token.findOne({
			where: {
				email: 'samahkinets@gmail.com',
				type: TokenTypes.verification,
			},
		});

		const res = await request(application.app).patch('/api/auth/email-confirmation').send({
			token: token?.token,
		});

		expect(res.body.user).toEqual(result);
	});

	let cookie: any;

	it('newEmailVerification - 204 success', async () => {
		const login = await request(application.app)
			.post('/api/auth/login')
			.send({ email: 'samahkinets@gmail.com', password: '123456' });

		cookie = login.headers['set-cookie'];
		await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'hadfidarkhiev@gmail.com' })
			.set('Cookie', cookie);

		const token: any = await application.sequelize.sequelize.query(
			'SELECT * FROM tokens where email = :email and type = :type',
			{
				replacements: {
					email: 'hadfidarkhiev@gmail.com',
					type: TokenTypes.verification,
				},
				type: QueryTypes.SELECT,
			},
		);
		const res = await request(application.app)
			.patch('/api/auth/new-email/confirmation')
			.send({ token: token[0].token })
			.set('Cookie', cookie);

		expect(res.statusCode).toBe(204);
	});

	it('newEmailVerification 404 - token not found', async () => {
		const res = await request(application.app)
			.patch('/api/auth/new-email/confirmation')
			.send({ token: 'token' })
			.set('Cookie', cookie);
		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			err: 'Токен авторизации не найден. Пожалуйста, убедитесь, что у вас правильный токен.',
		});
	});

	it('newEmailVerification 422 - validation error', async () => {
		const res = await request(application.app)
			.patch('/api/auth/new-email/confirmation')
			.send({})
			.set('Cookie', cookie);
		expect(res.statusCode).toBe(422);
		expect(res.body).toEqual([
			{
				children: [],
				constraints: {
					isNotEmpty: 'Поле токен не может быть пустым.',
					isString: 'Токен должен быть строкой.',
				},
				property: 'token',
				target: {},
			},
		]);
	});

	it('newEmailVerification 400 - token has expired', async () => {
		await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'hadfgidarkhiev@gmail.com' })
			.set('Cookie', cookie);
		await application.sequelize.sequelize.query(
			`UPDATE tokens set "expiresIn" = :expiresIn WHERE email = :email AND type = :type`,
			{
				replacements: {
					email: 'hadfgidarkhiev@gmail.com',
					type: TokenTypes.verification,
					expiresIn: new Date(),
				},
			},
		);

		const token: any = await application.sequelize.sequelize.query(
			`SELECT * FROM tokens WHERE email = :email AND type = :type`,
			{
				replacements: {
					email: 'hadfgidarkhiev@gmail.com',
					type: TokenTypes.verification,
				},
				type: QueryTypes.SELECT,
			},
		);
		const res = await request(application.app)
			.patch('/api/auth/new-email/confirmation')
			.send({ token: token[0].token })
			.set('Cookie', cookie);
		expect(res.statusCode).toBe(400);
		expect(res.body).toEqual({
			err: 'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения.',
		});
	});
});

afterAll(async () => {
	await application.sequelize.force();
	await application.close();
});
