import request from 'supertest';
import { boot } from '../src/main';
import { App } from '../src/app';
import { UserRole } from '../src/user/model/user.model';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

describe('User e2e tests', () => {
	const result = {
		id: 1,
		email: 'samahkinets@gmail.com',
		name: 'Islam',
		picture: '',
		role: UserRole.regular,
		isVerified: true,
		isTwoFactorEnabled: false,
		method: 'CREDENTIALS',
		createdAt: expect.any(String),
		updatedAt: expect.any(String),
	};

	const authData = {
		email: 'samahkinets@gmail.com',
		password: '12345678',
	};

	const registerData = {
		email: 'samahkinets@gmail.com',
		name: 'Islam',
		password: '12345678',
		passwordRepeat: '12345678',
	};

	let cookie: any

	it('Get profile - success', async () => {
		await request(application.app).post('/api/auth/register').send(registerData);

		await application.sequelize.sequelize.query(
			'UPDATE users SET "isVerified" = true WHERE email = :email',
			{
				replacements: { email: registerData.email },
			},
		);

		const login = await request(application.app).post('/api/auth/login').send(authData);

		cookie = login.headers['set-cookie'];

		const res = await request(application.app).get('/api/users/profile').set('Cookie', cookie);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(result);
		expect(res.body).toHaveProperty('id', 1);
		expect(res.body).not.toHaveProperty('password');
	});

	it('Get profile - error 401', async () => {
		const res = await request(application.app).get('/api/users/profile');
		expect(res.statusCode).toBe(401);
		expect(res.body).toEqual({
			err: 'Пользователь не авторизован. Пожалуйста, войдите в систему, чтобы получить доступ.',
		});
	});

	it('GetUserById - error 403', async () => {
		const res = await request(application.app).get('/api/users/1').set('Cookie', cookie);

		expect(res.statusCode).toBe(403);
		expect(res.body).toEqual({ err: 'Недостаточно прав. У вас не прав доступа к этом ресурсу.' });
	});

	it('GetUserById - success', async () => {
		result.role = UserRole.admin;
		await application.sequelize.sequelize.query(
			"UPDATE users SET role  = 'ADMIN' WHERE email = :email",
			{
				replacements: { email: 'samahkinets@gmail.com' },
			},
		);
		const res = await request(application.app).get('/api/users/1').set('Cookie', cookie);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(result);
		expect(res.body).toHaveProperty('id', 1);
		expect(res.body).not.toHaveProperty('password');
	});

	it('GetUserById - error 404', async () => {
		const res = await request(application.app).get('/api/users/100').set('Cookie', cookie);
		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			err: 'Пользователь не найден. Пожалуйста, проверьте введенные данные.',
		});
	});

	it('updateProfile - error validate 400', async () => {
		const res = await request(application.app)
			.patch('/api/users/profile-update')
			.set('Cookie', cookie)
			.send({});
		const errors = Object.fromEntries(res.body.map((err: any) => [err.property, err.constraints]));

		expect(res.statusCode).toBe(422);
		expect(errors.name).toMatchObject({
			isNotEmpty: 'Имя обязательно для заполнения.',
			isString: 'Имя должно быть строкой.',
		});
		expect(errors.isTwoFactorEnabled).toMatchObject({
			isBoolean: 'isTwoFactorEnabled должно быть булевым значением.',
		});
	});
	
	it('updateProfile - success', async () => {
        const { email, ...rest } = result
		const res = await request(application.app)
			.patch('/api/users/profile-update')
			.set('Cookie', cookie)
			.send({
				name: 'test',
				isTwoFactorEnabled: true
			});

		expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({...rest, name: 'test', isTwoFactorEnabled: true})
	});
});

afterAll(async () => {
	await application.sequelize.force();
	await application.close();
});
