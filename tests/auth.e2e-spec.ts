import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';
import { TokenTypes } from '../src/token/model/token.model';
import { AuthMethod } from '../src/user/model/user.model';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
	await application.sequelize.force();
});

describe('auth e2e', () => {
	let token: any;

	const registerData = {
		email: 'samahkinets@gmail.com',
		name: 'Muhammad',
		password: 'password',
		passwordRepeat: 'password',
	};

	const loginData = {
		email: 'samahkinets@gmail.com',
		password: 'password',
	};

	const result = {
		email: 'samahkinets@gmail.com',
		name: 'Muhammad',
		picture: '',
		role: 'REGULAR',
		isVerified: true,
		isTwoFactorEnabled: false,
		method: 'CREDENTIALS',
		createdAt: expect.any(String),
		updatedAt: expect.any(String),
	};

	it('Register validate - errors', async () => {
		const res = await request(application.app).post('/api/auth/register').send({});

		// console.dir(res.body, { depth: null });
		const errors = Object.fromEntries(res.body.map((err: any) => [err.property, err.constraints]));

		expect(res.statusCode).toBe(422);

		expect(errors).toEqual({
			name: {
				isNotEmpty: 'Имя обязательно для заполнения.',
				isString: 'Имя должно быть строкой.',
			},
			email: {
				isNotEmpty: 'Email обязателен для заполнения.',
				isEmail: 'Некорректный формат email.',
				isString: 'Email должен быть строкой.',
			},
			password: {
				minLength: 'Пароль должен содержать минимум 6 символов.',
				isNotEmpty: 'Пароль обязателен для заполнения.',
				isString: 'Пароль должен быть строкой.',
			},
			passwordRepeat: {
				minLength: 'Пароль подтверждения должен содержать не менее 6 символов.',
				isNotEmpty: 'Поля подтверждения пароля не может быть пустым.',
				isString: 'Пароль подтверждения должен быть строкой.',
			},
		});
	});

	it('Register conflict - error', async () => {
		const data = {
			email: 'hadidarkhiev@gmail.com',
			name: 'Muhammad',
			password: '123456',
			passwordRepeat: '123456',
		};
		await request(application.app).post('/api/auth/register').send(data);
		const res = await request(application.app).post('/api/auth/register').send(data);

		expect(res.body).toEqual({
			err: 'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.',
		});
	});

	it('Register - success', async () => {
		const res = await request(application.app).post('/api/auth/register').send(registerData);

		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			message:
				'Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовы адрес.',
		});
	});

	it('Login not Found - error', async () => {
		const res = await request(application.app)
			.post('/api/auth/login')
			.send({ email: 'samahkinets1@gmail.com', password: 'password' });

		expect(res.body).toEqual({
			err: 'Пользователь не найден. Пожалуйста, проверьте введенные данные.',
		});
	});

	it('Login invalid password - error', async () => {
		const res = await request(application.app).post('/api/auth/login').send({
			email: 'samahkinets@gmail.com',
			password: 'pasword',
		});

		expect(res.body).toEqual({
			err: 'Неверный пароль. Пожалуйста, попробуйте еще раз или восстановите пароль, если забыли его.',
		});
	});

	it('Login validate - errors', async () => {
		const res = await request(application.app).post('/api/auth/login').send({
			email: 'samahkinets',
			password: 'pas',
		});

		const errors = Object.fromEntries(res.body.map((err: any) => [err.property, err.constraints]));

		expect(res.statusCode).toBe(422);
		expect(errors.email.isEmail).toBe('Некорректный формат email.');
		expect(errors.password.minLength).toBe('Пароль должен содержать минимум 6 символов.');
	});

	it('Login - error not isVerification', async () => {
		const res = await request(application.app).post('/api/auth/login').send(loginData);

		expect(res.statusCode).toBe(401);
		expect(res.body).toEqual({
			err: 'Ваш email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите адрес.',
		});
	});

	it('Login - success', async () => {
		await application.sequelize.sequelize.query(
			'UPDATE users set "isVerified" = true WHERE email = :email',
			{
				replacements: { email: registerData.email },
			},
		);
		const res = await request(application.app).post('/api/auth/login').send(loginData);

		expect(res.statusCode).toBe(200);
		expect(res.body.user).toMatchObject(result);
		expect(res.body.user).toHaveProperty('id', 2);
		expect(res.headers['set-cookie'][0]).toMatch(/^session=.*;/);
		expect(res.body.user).not.toHaveProperty('password');
	});

	it('Login - success need code', async () => {
		await application.sequelize.sequelize.query(
			'UPDATE users set "isTwoFactorEnabled" = true WHERE email = :email',
			{
				replacements: { email: registerData.email },
			},
		);
		const res = await request(application.app).post('/api/auth/login').send(loginData);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			message: 'Проверьте вашу почту. Требуется код двухфакторной аутентификации.',
		});
	});

	it('Login - success code', async () => {
		const sql = (await application.sequelize.sequelize.query(
			`SELECT * FROM tokens WHERE email = :email AND type = :type`,
			{
				replacements: {
					email: registerData.email,
					type: TokenTypes.two_factor,
				},
			},
		)) as any;
		const code = sql[0][0].token;
		const res = await request(application.app)
			.post('/api/auth/login')
			.send({ ...loginData, code });

		await application.sequelize.sequelize.query(
			`UPDATE users set "isTwoFactorEnabled" = false WHERE email = :email`,
			{
				replacements: {
					email: registerData.email,
				},
			},
		);

		expect(res.statusCode).toBe(200);
		expect(res.body.user).toMatchObject({ ...result, isTwoFactorEnabled: true });
		expect(res.body.user).toHaveProperty('id', 2);
		expect(res.headers['set-cookie'][0]).toMatch(/^session=.*;/);
	});

	it('Logout - success', async () => {
		const res = await request(application.app).post('/api/auth/logout');

		expect(res.statusCode).toBe(204);
		expect(res.headers['set-cookie'][0]).toMatch(/^session=;/);
	});

	it('reset - password', async () => {
		const res = await request(application.app)
			.post('/api/auth/reset-password')
			.send({ email: registerData.email });

		expect(res.statusCode).toBe(200);
		expect(res.body).toBeTruthy();
	});

	it('reset - password error 404', async () => {
		const res = await request(application.app)
			.post('/api/auth/reset-password')
			.send({ email: 'samahkinets1@gmail.com' });

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			err: 'Пользователь не найден. Пожалуйста, проверьте введенные данные.',
		});
	});

	it('reset - password validate error 400', async () => {
		const res = await request(application.app).post('/api/auth/reset-password').send({ email: '' });
		const errors = Object.fromEntries(res.body.map((err: any) => [err.property, err.constraints]));

		expect(res.statusCode).toBe(422);
		expect(errors).toEqual({
			email: {
				isNotEmpty: 'Поля email не может быть пустым.',
				isEmail: 'Ведите корректный адрес электронной почты.',
			},
		});
	});

	it('newPassword - error validate 400', async () => {
		const res = await request(application.app).post('/api/auth/new-password/token').send({});
		const errors = Object.fromEntries(res.body.map((err: any) => [err.property, err.constraints]));

		expect(res.statusCode).toBe(422);
		expect(errors.password).toEqual({
			isNotEmpty: 'Поля новый пароль не может быть пустым.',
			minLength: 'Пароль должен содержать не менее 6 символов.',
			isString: 'Пароль должен быть строкой.',
		});
	});

	it('newPassword - error  Not found user 404', async () => {
		const sql = (await application.sequelize.sequelize.query(
			`SELECT * FROM tokens WHERE email = :email AND type = :type`,
			{
				replacements: {
					email: registerData.email,
					type: TokenTypes.password_reset,
				},
			},
		)) as any;
		token = sql[0][0].token;
		let email = sql[0][0].email;

		await application.sequelize.sequelize.query(`DELETE FROM users WHERE email = :email`, {
			replacements: {
				email,
			},
		});

		const res = await request(application.app)
			.post(`/api/auth/new-password/${token}`)
			.send({ password: '12345678' });

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			err: 'Пользователь не найден. Пожалуйста, проверьте введенные данные.',
		});
	});

	it('newPassword - error token time expired', async () => {
		await application.sequelize.sequelize.query(
			`UPDATE tokens set "expiresIn" = :date WHERE email = :email`,
			{
				replacements: {
					email: registerData.email,
					date: new Date().toISOString(),
				},
			},
		);
		const res = await request(application.app)
			.post(`/api/auth/new-password/${token}`)
			.send({ password: '1234567890' });

		expect(res.statusCode).toBe(400);
		expect(res.body).toEqual({
			err: 'Время токена истек. Пожалуйста, запросите новый токен для подтверждения сброса пароля.',
		});
	});

	it('newPassword - success', async () => {
		await request(application.app).post('/api/auth/register').send(registerData);
		await application.sequelize.sequelize.query(
			`UPDATE users set "isVerified" = true WHERE email = :email`,
			{
				replacements: {
					email: registerData.email,
				},
			},
		);

		await request(application.app)
			.post('/api/auth/reset-password')
			.send({ email: registerData.email });
		const sql = (await application.sequelize.sequelize.query(
			`SELECT * FROM tokens WHERE email = :email AND type = :type`,
			{
				replacements: {
					email: registerData.email,
					type: TokenTypes.password_reset,
				},
			},
		)) as any;

		token = sql[0][0].token;
		const res = await request(application.app)
			.post(`/api/auth/new-password/${token}`)
			.send({ password: '123456789' });

		expect(res.statusCode).toBe(200);
		expect(res.body).toBeTruthy();

		const login = await request(application.app)
			.post('/api/auth/login')
			.send({ email: 'samahkinets@gmail.com', password: '123456789' });

		expect(login.statusCode).toBe(200);
	});

	let cookie: any;

	it('update-email -success', async () => {
		const login = await request(application.app)
			.post('/api/auth/login')
			.send({ email: 'samahkinets@gmail.com', password: '123456789' });

		cookie = login.headers['set-cookie'];
		const res = await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'hadfidarkhiev@gmail.com' })
			.set('Cookie', cookie);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ message: 'Проверьте почту для подтверждения.' });
	});



	it('update-email 409', async () => {
		const res = await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'samahkinets@gmail.com' })
			.set('Cookie', cookie);

		expect(res.statusCode).toBe(409);
		expect(res.body).toEqual({ err: 'Email уже занят.' });
	});

	it('update-email 404 not found', async () => {
		await application.sequelize.sequelize.query(
			`UPDATE users set "method" = :method WHERE email = :email`,
			{
				replacements: {
					email: 'samahkinets@gmail.com',
					method: AuthMethod.google,
				},
			},
		);
		const res = await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'hadfidarkhiev@gmail.com' })
			.set('Cookie', cookie);
		expect(res.statusCode).toBe(403);
		expect(res.body).toEqual({ err: 'Недопустимое действие!' });

		await application.sequelize.sequelize.query(
			`UPDATE users set "method" = :method WHERE email = :email`,
			{
				replacements: {
					email: 'samahkinets@gmail.com',
					method: AuthMethod.credentials,
				},
			},
		);
	});

	it('update-password success', async () => {
		const res = await request(application.app)
			.patch('/api/auth/update-password')
			.send({ oldPassword: '123456789', password: '123456', passwordRepeat: '123456' })
			.set('Cookie', cookie);
		expect(res.statusCode).toBe(200);
	});

	it('update-password 400 wrong password', async () => {
		const res = await request(application.app)
			.patch('/api/auth/update-password')
			.send({ oldPassword: '12345678', password: '123456', passwordRepeat: '123456' })
			.set('Cookie', cookie);
		expect(res.statusCode).toBe(400);
		expect(res.body).toEqual({ err: 'Неправильный пароль.' });
	});

	it('update-password 422 validation error', async () => {
		const res = await request(application.app)
			.patch('/api/auth/update-password')
			.send({})
			.set('Cookie', cookie);
		const errors = Object.fromEntries(res.body.map((err: any) => [err.property, err.constraints]));
		expect(res.statusCode).toBe(422);
		expect(errors).toEqual({
			oldPassword: {
				isNotEmpty: 'Пароль обязателен для заполнения.',
				isString: 'Пароль должен быть строкой.',
				minLength: 'Пароль должен содержать минимум 6 символов.',
			},
			password: {
				IsNewPasswordDifferent: 'Новый пароль не должен совпадать со старым.',
				isNotEmpty: 'Пароль обязателен для заполнения.',
				isString: 'Пароль должен быть строкой.',
				minLength: 'Пароль должен содержать минимум 6 символов.',
			},
			passwordRepeat: {
				isNotEmpty: 'Поля подтверждения пароля не может быть пустым.',
				isString: 'Пароль подтверждения должен быть строкой.',
				minLength: 'Пароль подтверждения должен содержать не менее 6 символов.',
			},
		});
	});

	it('update-password confirmation two-factor authentication', async () => {
		await application.sequelize.sequelize.query(
			`UPDATE users set "isTwoFactorEnabled" = :isTwoFactorEnabled  WHERE email = :email`,
			{
				replacements: {
					email: 'samahkinets@gmail.com',
					isTwoFactorEnabled: true,
				},
			},
		);

		await request(application.app)
			.patch('/api/auth/update-password')
			.send({ oldPassword: '123456', password: '1234567', passwordRepeat: '1234567' })
			.set('Cookie', cookie);

		const [rows]: any = await application.sequelize.sequelize.query(
			`SELECT * FROM tokens WHERE email = :email AND type = :type`,
			{
				replacements: {
					email: 'samahkinets@gmail.com',
					type: TokenTypes.two_factor,
				},
			},
		);

		const res = await request(application.app)
			.patch('/api/auth/update-password')
			.send({
				oldPassword: '123456',
				password: '1234567',
				passwordRepeat: '1234567',
				code: rows[0].token,
			})
			.set('Cookie', cookie);

		expect(res.statusCode).toBe(200);
	});

	it('update-email -success', async () => {
		await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'hadfidarkhiev@gmail.com' })
			.set('Cookie', cookie);
		const [rows]: any = await application.sequelize.sequelize.query(`SELECT * FROM tokens  WHERE email = :email AND type = :type`, {
			replacements: {
				email: 'samahkinets@gmail.com',
				type: TokenTypes.two_factor
			}
		})
		
		const res = await request(application.app)
			.post('/api/auth/update-email')
			.send({ email: 'hadfidarkhiev@gmail.com', code: rows[0].token})
			.set('Cookie', cookie);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ message: 'Проверьте почту для подтверждения.' });
	});
});

afterAll(async () => {
	await application.sequelize.force();
	await application.close();
});
