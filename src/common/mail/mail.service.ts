import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { MailConfig } from '../../configs/mail.config';
import { render } from '@react-email/render';
import { DotenvConfig } from '../../configs/dotenv.config';
import { ConfirmationTemplate } from '../../auth/libs/templates/confirmation.tamplate';
import { ResetPasswordTemplate } from '../../auth/libs/templates/reset.password.template';
import { TwoFactorAuthTemplate } from '../../auth/libs/templates/two-factor-auth.template';
import { UpdatePasswordTemplate } from '../../auth/libs/templates/updatePassword.tamplate';

@injectable()
export class MailService {
	constructor(
		@inject(TYPES.MailConfig) private mailConfig: MailConfig,
		@inject(TYPES.DotenvConfig) private dotenvConfig: DotenvConfig,
	) {}

	public async sendConfirmationEmail(email: string, token: string, pathUrl: string) {
		const domain = this.dotenvConfig.get('CLIENT_URL_NAME');
		const confirmLink = `${domain}/${pathUrl}?token=${token}`;

		try {
			const html = await render(ConfirmationTemplate({ confirmLink }));
			return this.sendMail(email, 'Подтверждение почты', html);
		} catch (error) {
			console.log(error);
		}
	}
	public async sendPasswordResetEmail(email: string, token: string) {
		const domain = this.dotenvConfig.get('CLIENT_URL_NAME');
		try {
			const html = await render(ResetPasswordTemplate({ domain, token }));
			return this.sendMail(email, 'Сброс пароля', html);
		} catch (error) {
			console.log(error);
		}
	}

	public async sendPasswordUpdateEmail(email: string) {
		const domain = this.dotenvConfig.get('CLIENT_URL_NAME');
		try {
			const html = await render(UpdatePasswordTemplate({ domain }));
			return this.sendMail(email, 'Изменения пароля', html);
		} catch (error) {
			console.log(error);
		}
	}

	public async sendTwoFactorTokenEmail(email: string, token: string) {
		try {
			const html = await render(TwoFactorAuthTemplate({ token }));
			return this.sendMail(email, 'Подтверждение вашей личности', html);
		} catch (error) {
			console.log(error);
		}
	}

	private sendMail(email: string, subject: string, html: string): Promise<unknown> {
		return this.mailConfig.transporter.sendMail({
			from: `Тестовое сообщение от ${this.dotenvConfig.get('MAIL_LOGIN')}`,
			to: email,
			subject,
			html,
		});
	}
}
